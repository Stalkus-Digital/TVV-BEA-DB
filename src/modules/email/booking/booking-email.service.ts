import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, type Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import { AuditEventType } from "@/modules/auth/types/audit-log";
import type { AuditLogService } from "@/modules/auth/audit/audit-log.service";
import { EmailService } from "../email.service";
import { createLogger } from "@/shared/logger";
import { renderBookingEmailTemplate } from "./booking-email-templates";
import {
  EmailDispatchStatus,
  isTransactionalEmailOptedOut,
  isValidRecipientEmail,
  templateForBookingEmailEvent,
  type BookingEmailPayload,
  type EnqueueBookingEmailInput,
} from "./booking-email.types";

/**
 * Booking email orchestrator — reuses EmailService (SMTP vault).
 * Callers must use enqueueBookingEmail() so booking mutations never await SMTP.
 */
export class BookingEmailService extends BaseService {
  private readonly email: EmailService;

  constructor(
    context: ServiceContext,
    private readonly auditLog?: AuditLogService,
    email?: EmailService
  ) {
    super(context);
    this.email = email ?? new EmailService({ logger: createLogger("email.service") });
  }

  /**
   * Queues async delivery. Resolves after dispatch QUEUED row;
   * SMTP send runs in the background. Never throws for SMTP failures
   * when used via enqueueBookingEmail.
   */
  async sendForBooking(
    input: EnqueueBookingEmailInput & { payload: BookingEmailPayload }
  ): Promise<Result<{ queued: boolean; skipped: boolean }, AppError>> {
    const templateId = templateForBookingEmailEvent(input.event);
    const baseKey = input.dedupeKey ?? `${input.event}:${input.payload.bookingId}:EMAIL`;
    const dedupeKey = input.forceRetry ? `${baseKey}:retry:${Date.now()}` : baseKey;
    const recipient = input.payload.recipientEmail?.trim() ?? null;

    if (!isValidRecipientEmail(recipient)) {
      this.logger.info("Skipping booking email — no valid recipient", {
        event: input.event,
        bookingId: input.payload.bookingId,
      });
      await this.audit(AuditEventType.EMAIL_FAILED, input, {
        dedupeKey,
        templateId,
        status: EmailDispatchStatus.SKIPPED,
        error: "No valid recipient email",
      });
      return ok({ queued: false, skipped: true });
    }

    if (await this.isCustomerOptedOut(input.payload.bookingId)) {
      this.logger.info("Skipping booking email — customer opted out", {
        event: input.event,
        bookingId: input.payload.bookingId,
      });
      await this.audit(AuditEventType.EMAIL_FAILED, input, {
        dedupeKey,
        templateId,
        recipient,
        status: EmailDispatchStatus.SKIPPED,
        error: "Customer opted out of transactional email",
      });
      return ok({ queued: false, skipped: true });
    }

    const now = new Date();
    try {
      await prisma.emailDispatch.create({
        data: {
          dedupeKey,
          bookingId: input.payload.bookingId,
          event: input.event,
          templateId,
          status: EmailDispatchStatus.QUEUED,
          recipient,
          errorMessage: null,
          createdAt: now,
          updatedAt: now,
        },
      });
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === "P2002") {
        this.logger.info("Duplicate booking email suppressed", { dedupeKey, event: input.event });
        return ok({ queued: false, skipped: true });
      }
      this.logger.error("Failed to create email dispatch row", { error, dedupeKey });
      await this.audit(AuditEventType.EMAIL_FAILED, input, {
        dedupeKey,
        templateId,
        recipient,
        error: "Failed to queue email dispatch",
      });
      return ok({ queued: false, skipped: true });
    }

    if (input.forceRetry) {
      await this.audit(AuditEventType.EMAIL_RETRIED, input, {
        dedupeKey,
        templateId,
        recipient,
      });
    }

    void this.deliver(input, recipient, templateId, dedupeKey).catch((error) => {
      this.logger.error("Unhandled booking email delivery error", { error, dedupeKey });
    });

    return ok({ queued: true, skipped: false });
  }

  private async deliver(
    input: EnqueueBookingEmailInput & { payload: BookingEmailPayload },
    recipient: string,
    templateId: ReturnType<typeof templateForBookingEmailEvent>,
    dedupeKey: string
  ): Promise<void> {
    const rendered = renderBookingEmailTemplate(templateId, input.payload);

    try {
      const result = await this.email.sendEmail({
        to: recipient,
        subject: rendered.subject,
        html: rendered.html,
      });

      if (!result.ok) {
        await prisma.emailDispatch.update({
          where: { dedupeKey },
          data: {
            status: EmailDispatchStatus.FAILED,
            errorMessage: result.error.message,
            updatedAt: new Date(),
          },
        });
        await this.audit(AuditEventType.EMAIL_FAILED, input, {
          dedupeKey,
          templateId,
          recipient,
          error: result.error.message,
        });
        this.logger.warn("Booking email delivery failed", { dedupeKey, error: result.error.message });
        return;
      }

      await prisma.emailDispatch.update({
        where: { dedupeKey },
        data: {
          status: EmailDispatchStatus.SENT,
          errorMessage: null,
          updatedAt: new Date(),
        },
      });
      await this.audit(AuditEventType.EMAIL_SENT, input, {
        dedupeKey,
        templateId,
        recipient,
        subject: rendered.subject,
      });
      this.logger.info("Booking email sent", { dedupeKey, event: input.event, templateId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown email delivery error";
      await prisma.emailDispatch
        .update({
          where: { dedupeKey },
          data: {
            status: EmailDispatchStatus.FAILED,
            errorMessage: message,
            updatedAt: new Date(),
          },
        })
        .catch(() => undefined);
      await this.audit(AuditEventType.EMAIL_FAILED, input, {
        dedupeKey,
        templateId,
        recipient,
        error: message,
      });
    }
  }

  private async isCustomerOptedOut(bookingId: string): Promise<boolean> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { customerId: true },
    });
    if (!booking?.customerId) return false;
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: booking.customerId },
      select: { preferences: true },
    });
    return isTransactionalEmailOptedOut(profile?.preferences);
  }

  private async audit(
    eventType: (typeof AuditEventType)[keyof typeof AuditEventType],
    input: EnqueueBookingEmailInput & { payload: BookingEmailPayload },
    details: Record<string, unknown>
  ): Promise<void> {
    if (!this.auditLog) return;
    await this.auditLog.record({
      eventType,
      actorUserId: input.actorUserId ?? null,
      details: {
        bookingId: input.payload.bookingId,
        bookingNumber: input.payload.bookingNumber,
        event: input.event,
        ...details,
      },
    });
  }
}

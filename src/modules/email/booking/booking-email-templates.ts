import type { BookingEmailPayload, BookingEmailTemplateId } from "./booking-email.types";
import { BookingEmailTemplateId as TemplateIds } from "./booking-email.types";

export interface RenderedBookingEmail {
  subject: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; border: 1px solid #e7e5e4; border-radius: 4px; overflow: hidden;">
      <div style="background: #0f766e; color: #fff; padding: 20px 24px;">
        <p style="margin: 0; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.9;">The Vacation Voice</p>
        <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: normal;">${escapeHtml(title)}</h1>
      </div>
      <div style="padding: 24px; color: #1c1917; font-size: 15px; line-height: 1.55;">
        ${bodyHtml}
        <p style="margin: 28px 0 0; font-size: 13px; color: #78716c;">Thank you for travelling with The Vacation Voice.</p>
      </div>
    </div>
  `.trim();
}

function money(payload: BookingEmailPayload): string {
  if (payload.amount == null) return "";
  return `${payload.currency ?? "INR"} ${payload.amount}`;
}

/** Provider-independent booking email templates — consistent TVV branding. */
export function renderBookingEmailTemplate(
  templateId: BookingEmailTemplateId,
  payload: BookingEmailPayload
): RenderedBookingEmail {
  const name = payload.recipientName?.trim() || "Traveller";
  const bookingNumber = payload.bookingNumber;

  switch (templateId) {
    case TemplateIds.BOOKING_CREATED:
      return {
        subject: `Booking created: ${bookingNumber}`,
        html: layout(
          "Booking created",
          `<p>Dear ${escapeHtml(name)},</p>
           <p>Your booking <strong>${escapeHtml(bookingNumber)}</strong> has been created and is awaiting confirmation.</p>`
        ),
      };
    case TemplateIds.BOOKING_CONFIRMATION:
      return {
        subject: `Booking confirmed: ${bookingNumber}`,
        html: layout(
          "Booking confirmed",
          `<p>Dear ${escapeHtml(name)},</p>
           <p>Your booking <strong>${escapeHtml(bookingNumber)}</strong> is confirmed.</p>
           <p>We are finalizing arrangements with our suppliers. You will receive vouchers when they are ready.</p>`
        ),
      };
    case TemplateIds.BOOKING_CANCELLATION:
      return {
        subject: `Booking cancelled: ${bookingNumber}`,
        html: layout(
          "Booking cancelled",
          `<p>Dear ${escapeHtml(name)},</p>
           <p>Your booking <strong>${escapeHtml(bookingNumber)}</strong> has been cancelled.</p>
           ${payload.reason ? `<p>Reason: ${escapeHtml(payload.reason)}</p>` : ""}`
        ),
      };
    case TemplateIds.PAYMENT_CONFIRMATION:
      return {
        subject: `Payment received: ${bookingNumber}`,
        html: layout(
          "Payment confirmation",
          `<p>Dear ${escapeHtml(name)},</p>
           <p>We have received your payment${payload.amount != null ? ` of <strong>${escapeHtml(money(payload))}</strong>` : ""} for booking <strong>${escapeHtml(bookingNumber)}</strong>.</p>`
        ),
      };
    case TemplateIds.REFUND_CONFIRMATION:
      return {
        subject: `Refund processed: ${bookingNumber}`,
        html: layout(
          "Refund confirmation",
          `<p>Dear ${escapeHtml(name)},</p>
           <p>A refund${payload.amount != null ? ` of <strong>${escapeHtml(money(payload))}</strong>` : ""} has been processed for booking <strong>${escapeHtml(bookingNumber)}</strong>.</p>
           ${payload.reason ? `<p>Reason: ${escapeHtml(payload.reason)}</p>` : ""}`
        ),
      };
    case TemplateIds.INVOICE_READY:
      return {
        subject: `Invoice ready: ${payload.invoiceNumber ?? bookingNumber}`,
        html: layout(
          "Invoice ready",
          `<p>Dear ${escapeHtml(name)},</p>
           <p>Your invoice <strong>${escapeHtml(payload.invoiceNumber ?? "—")}</strong> for booking <strong>${escapeHtml(bookingNumber)}</strong> is ready.</p>
           ${payload.amount != null ? `<p>Total: <strong>${escapeHtml(money(payload))}</strong></p>` : ""}`
        ),
      };
    case TemplateIds.VOUCHER_READY:
      return {
        subject: `Voucher ready: ${payload.voucherNumber ?? bookingNumber}`,
        html: layout(
          "Voucher ready",
          `<p>Dear ${escapeHtml(name)},</p>
           <p>Your travel voucher <strong>${escapeHtml(payload.voucherNumber ?? "—")}</strong> for booking <strong>${escapeHtml(bookingNumber)}</strong> is ready.</p>`
        ),
      };
    default: {
      const _exhaustive: never = templateId;
      return { subject: `Update: ${bookingNumber}`, html: layout("Update", `<p>${String(_exhaustive)}</p>`) };
    }
  }
}

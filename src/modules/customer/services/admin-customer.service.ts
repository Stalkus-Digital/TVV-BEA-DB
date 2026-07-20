import { randomBytes } from "node:crypto";
import { err, isErr, ok, type PaginatedResult, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { ConflictError, NotFoundError, type AppError } from "@/shared/errors";
import { AuditEventType } from "@/modules/auth/types/audit-log";
import { getUserHandler, getUserService, toPublicUser, type PublicUser } from "@/modules/auth";
import { getRoleService } from "@/modules/auth/module";
import { RoleName } from "@/modules/auth/types/role";
import { hashPassword } from "@/modules/auth/services/password.service";
import type { AuditLogService } from "@/modules/auth/audit/audit-log.service";
import { prisma } from "@/shared/database/prisma-client";
import type { CustomerProfileRepository } from "../repositories/customer-profile.repository";
import type { CustomerNoteRepository } from "../repositories/customer-note.repository";
import type { CustomerFullProfile } from "./customer-profile.service";
import type { CustomerNote } from "../types/customer-note";
import type { CustomerProfile } from "../types/customer-profile";
import {
  validateAdminCustomerNoteBody,
  validateBulkArchiveCustomers,
  validateCreateAdminCustomer,
  validateUpdateAdminCustomer,
  type ListAdminCustomersQuery,
} from "../validation/admin-customer.validation";

export interface AdminCustomerDetail extends CustomerFullProfile {
  isActive: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPaymentRecord {
  id: string;
  bookingId: string;
  bookingNumber: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference: string | null;
  createdAt: string;
}

function toAdminDetail(user: PublicUser, profile: CustomerProfile | null): AdminCustomerDetail {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: profile?.phone ?? null,
    dateOfBirth: profile?.dateOfBirth ?? null,
    nationality: profile?.nationality ?? null,
    passportNumber: profile?.passportNumber ?? null,
    passportExpiry: profile?.passportExpiry ?? null,
    passportCountry: profile?.passportCountry ?? null,
    emergencyContact: profile?.emergencyContact ?? null,
    preferences: profile?.preferences ?? null,
    isActive: user.isActive,
    emailVerifiedAt: user.emailVerifiedAt,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class AdminCustomerService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly profiles: CustomerProfileRepository,
    private readonly notes: CustomerNoteRepository,
    private readonly auditLog?: AuditLogService
  ) {
    super(context);
  }

  private async recordAudit(
    eventType: AuditEventType,
    actorUserId: string | null,
    targetUserId: string,
    details?: Record<string, unknown>
  ) {
    if (!this.auditLog) return;
    await this.auditLog.record({
      eventType,
      actorUserId,
      targetUserId,
      details: { customerId: targetUserId, ...details },
    });
  }

  async list(query: ListAdminCustomersQuery = {}): Promise<Result<PaginatedResult<PublicUser>, AppError>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const search = query.search?.trim().toLowerCase();

    const customerRole = await getRoleService().getByName(RoleName.CUSTOMER);
    if (isErr(customerRole)) return customerRole;

    const userRoles = await prisma.userRole.findMany({
      where: { roleId: customerRole.value.id },
      select: { userId: true },
    });
    const customerUserIds = userRoles.map((r) => r.userId);

    const where: {
      id?: { in: string[] };
      isActive?: boolean;
      emailVerifiedAt?: { not: null } | null;
      OR?: Array<{ email?: { contains: string; mode: "insensitive" }; fullName?: { contains: string; mode: "insensitive" } }>;
    } = { id: { in: customerUserIds.length > 0 ? customerUserIds : ["__none__"] } };

    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.emailVerified === "verified") where.emailVerifiedAt = { not: null };
    if (query.emailVerified === "unverified") where.emailVerifiedAt = null;

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    let items = rows.map((row) => toPublicUser({
      ...row,
      emailVerifiedAt: row.emailVerifiedAt?.toISOString() ?? null,
      lockedUntil: row.lockedUntil?.toISOString() ?? null,
      lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));

    if (search) {
      const profiles = await prisma.customerProfile.findMany({
        where: { phone: { contains: search, mode: "insensitive" } },
        select: { userId: true },
      });
      const phoneUserIds = new Set(profiles.map((p) => p.userId));
      if (phoneUserIds.size > 0) {
        const extraUsers = await prisma.user.findMany({
          where: { id: { in: [...phoneUserIds], notIn: items.map((u) => u.id) } },
        });
        items = [
          ...items,
          ...extraUsers.map((row) => toPublicUser({
            ...row,
            emailVerifiedAt: row.emailVerifiedAt?.toISOString() ?? null,
            lockedUntil: row.lockedUntil?.toISOString() ?? null,
            lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
          })),
        ];
      }
    }

    return ok({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  }

  async getById(userId: string): Promise<Result<AdminCustomerDetail, AppError>> {
    const user = await getUserHandler(userId);
    if (isErr(user)) return user;
    const profile = await this.profiles.findByUserId(userId);
    if (isErr(profile)) return profile;
    return ok(toAdminDetail(user.value, profile.value));
  }

  async create(input: unknown, actorUserId: string | null): Promise<Result<AdminCustomerDetail, AppError>> {
    const validated = validateCreateAdminCustomer(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    const emailCheck = await prisma.user.findFirst({
      where: { email: { equals: value.email, mode: "insensitive" } },
    });
    if (emailCheck) return err(new ConflictError(`Email "${value.email}" is already registered`));

    if (value.phone) {
      const phoneCheck = await prisma.customerProfile.findFirst({
        where: { phone: value.phone },
      });
      if (phoneCheck) return err(new ConflictError(`Phone "${value.phone}" is already registered to another customer`));
    }

    const passwordHash = await hashPassword(randomBytes(16).toString("hex"));
    const now = new Date();
    const userRepo = await prisma.user.create({
      data: {
        email: value.email,
        fullName: value.fullName,
        passwordHash,
        isActive: true,
        emailVerifiedAt: now,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
      },
    });

    const customerRole = await getRoleService().getByName(RoleName.CUSTOMER);
    if (!isErr(customerRole)) {
      await getRoleService().assignToUser(userRepo.id, customerRole.value.id);
    }

    await this.profiles.upsert(userRepo.id, { phone: value.phone ?? null });
    await this.recordAudit(AuditEventType.CUSTOMER_CREATED, actorUserId, userRepo.id, { email: value.email, source: "manual" });

    const user = await getUserHandler(userRepo.id);
    if (isErr(user)) return user;
    const profile = await this.profiles.findByUserId(userRepo.id);
    if (isErr(profile)) return profile;
    return ok(toAdminDetail(user.value, profile.value));
  }

  async update(userId: string, input: unknown, actorUserId: string | null): Promise<Result<AdminCustomerDetail, AppError>> {
    const validated = validateUpdateAdminCustomer(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    const existing = await this.getById(userId);
    if (isErr(existing)) return existing;

    if (value.phone) {
      const phoneCheck = await prisma.customerProfile.findFirst({
        where: { phone: value.phone, NOT: { userId } },
      });
      if (phoneCheck) return err(new ConflictError(`Phone "${value.phone}" is already registered to another customer`));
    }

    if (value.fullName !== undefined || value.isActive !== undefined) {
      const updated = await getUserService().update(userId, {
        ...(value.fullName !== undefined ? { fullName: value.fullName } : {}),
        ...(value.isActive !== undefined ? { isActive: value.isActive } : {}),
      });
      if (isErr(updated)) return updated;
    }

    if (value.phone !== undefined) {
      const profile = await this.profiles.upsert(userId, { phone: value.phone });
      if (isErr(profile)) return profile;
    }

    await this.recordAudit(AuditEventType.CUSTOMER_UPDATED, actorUserId, userId, { changes: value });
    return this.getById(userId);
  }

  async archive(userId: string, actorUserId: string | null): Promise<Result<AdminCustomerDetail, AppError>> {
    const result = await getUserService().deactivate(userId);
    if (isErr(result)) return result;
    await this.recordAudit(AuditEventType.CUSTOMER_ARCHIVED, actorUserId, userId, {});
    return this.getById(userId);
  }

  async restore(userId: string, actorUserId: string | null): Promise<Result<AdminCustomerDetail, AppError>> {
    const result = await getUserService().update(userId, { isActive: true });
    if (isErr(result)) return result;
    await this.recordAudit(AuditEventType.CUSTOMER_RESTORED, actorUserId, userId, {});
    return this.getById(userId);
  }

  async bulkArchive(input: unknown, actorUserId: string | null): Promise<Result<{ updated: number }, AppError>> {
    const validated = validateBulkArchiveCustomers(input);
    if (isErr(validated)) return validated;

    let updated = 0;
    for (const id of validated.value.ids) {
      const result = await this.archive(id, actorUserId);
      if (!isErr(result)) updated += 1;
    }
    return ok({ updated });
  }

  async listNotes(userId: string): Promise<Result<CustomerNote[], AppError>> {
    const existing = await getUserHandler(userId);
    if (isErr(existing)) return existing;
    return this.notes.listByUserId(userId);
  }

  async addNote(userId: string, input: unknown, authorUserId: string | null): Promise<Result<CustomerNote, AppError>> {
    const validated = validateAdminCustomerNoteBody(input);
    if (isErr(validated)) return validated;

    const existing = await getUserHandler(userId);
    if (isErr(existing)) return existing;

    return this.notes.add({
      userId,
      authorUserId,
      body: validated.value.body,
      createdAt: new Date().toISOString(),
    });
  }

  async deleteNote(userId: string, noteId: string): Promise<Result<void, AppError>> {
    const note = await this.notes.findById(noteId);
    if (isErr(note)) return note;
    if (!note.value || note.value.userId !== userId) {
      return err(new NotFoundError(`Customer note "${noteId}" not found`));
    }
    return this.notes.delete(noteId);
  }

  async listPayments(userId: string): Promise<Result<CustomerPaymentRecord[], AppError>> {
    const existing = await getUserHandler(userId);
    if (isErr(existing)) return existing;

    const bookings = await prisma.booking.findMany({
      where: { customerId: userId },
      select: { id: true, bookingNumber: true },
    });
    if (bookings.length === 0) return ok([]);

    const bookingMap = new Map(bookings.map((b) => [b.id, b.bookingNumber]));
    const payments = await prisma.bookingPayment.findMany({
      where: { bookingId: { in: bookings.map((b) => b.id) } },
      orderBy: { createdAt: "desc" },
    });

    return ok(
      payments.map((p) => ({
        id: p.id,
        bookingId: p.bookingId,
        bookingNumber: bookingMap.get(p.bookingId) ?? p.bookingId,
        amount: p.amount,
        currency: p.currency,
        method: p.method ?? "—",
        status: p.status,
        reference: p.reference,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  }
}

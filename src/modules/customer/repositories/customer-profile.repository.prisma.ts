import { ok, type Result } from "@/shared/types";
import type { AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import type { CustomerProfile as PrismaCustomerProfileRow } from "@/generated/prisma/client";
import type { CustomerProfile } from "../types/customer-profile";
import type { CustomerProfileRepository, UpsertCustomerProfileData } from "./customer-profile.repository";

/**
 * `dateOfBirth`/`passportExpiry` are truncated to date-only (YYYY-MM-DD) on
 * read, matching the exact same fix applied to Traveller in Sprint 12 —
 * these are always date-only inputs in practice, and a full ISO timestamp
 * would silently break any downstream equality check against the raw
 * input string.
 */
function toDomain(row: PrismaCustomerProfileRow): CustomerProfile {
  const hasEmergencyContact = row.emergencyContactName !== null && row.emergencyContactPhone !== null;
  return {
    id: row.id,
    userId: row.userId,
    phone: row.phone,
    dateOfBirth: row.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    nationality: row.nationality,
    passportNumber: row.passportNumber,
    passportExpiry: row.passportExpiry?.toISOString().slice(0, 10) ?? null,
    passportCountry: row.passportCountry,
    emergencyContact: hasEmergencyContact
      ? { name: row.emergencyContactName as string, phone: row.emergencyContactPhone as string, relation: row.emergencyContactRelation }
      : null,
    preferences: (row.preferences as Record<string, unknown> | null) ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PrismaCustomerProfileRepository implements CustomerProfileRepository {
  async findByUserId(userId: string): Promise<Result<CustomerProfile | null, AppError>> {
    const row = await prisma.customerProfile.findUnique({ where: { userId } });
    return ok(row ? toDomain(row) : null);
  }

  async upsert(userId: string, data: UpsertCustomerProfileData): Promise<Result<CustomerProfile, AppError>> {
    const now = new Date();
    const emergencyContact = data.emergencyContact;
    const flatEmergencyContact =
      emergencyContact === undefined
        ? {}
        : {
            emergencyContactName: emergencyContact?.name ?? null,
            emergencyContactPhone: emergencyContact?.phone ?? null,
            emergencyContactRelation: emergencyContact?.relation ?? null,
          };

    const row = await prisma.customerProfile.upsert({
      where: { userId },
      create: {
        userId,
        phone: data.phone ?? null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        nationality: data.nationality ?? null,
        passportNumber: data.passportNumber ?? null,
        passportExpiry: data.passportExpiry ? new Date(data.passportExpiry) : null,
        passportCountry: data.passportCountry ?? null,
        emergencyContactName: emergencyContact?.name ?? null,
        emergencyContactPhone: emergencyContact?.phone ?? null,
        emergencyContactRelation: emergencyContact?.relation ?? null,
        preferences: (data.preferences as object | null) ?? undefined,
        createdAt: now,
        updatedAt: now,
      },
      update: {
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.dateOfBirth !== undefined ? { dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null } : {}),
        ...(data.nationality !== undefined ? { nationality: data.nationality } : {}),
        ...(data.passportNumber !== undefined ? { passportNumber: data.passportNumber } : {}),
        ...(data.passportExpiry !== undefined ? { passportExpiry: data.passportExpiry ? new Date(data.passportExpiry) : null } : {}),
        ...(data.passportCountry !== undefined ? { passportCountry: data.passportCountry } : {}),
        ...flatEmergencyContact,
        ...(data.preferences !== undefined ? { preferences: (data.preferences as object | null) ?? undefined } : {}),
        updatedAt: now,
      },
    });
    return ok(toDomain(row));
  }
}

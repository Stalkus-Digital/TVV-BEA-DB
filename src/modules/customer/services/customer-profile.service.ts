import { isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import type { AppError } from "@/shared/errors";
import { getUserHandler, getUserService, toPublicUser, type PublicUser } from "@/modules/auth";
import type { CustomerProfile } from "../types/customer-profile";
import type { CustomerProfileRepository } from "../repositories/customer-profile.repository";
import { validateUpdateCustomerProfile, validateUpdateMe, type UpdateCustomerProfileInput, type UpdateMeInput } from "../validation/customer-profile.validation";

/** `GET /api/me`'s shape — the lean identity view, no extended profile fields. */
export interface CustomerAccount {
  id: string;
  email: string;
  fullName: string;
}

/** `GET /api/me/profile`'s shape — Auth's basic identity merged with the extended `CustomerProfile`. */
export interface CustomerFullProfile extends CustomerAccount {
  phone: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  passportCountry: string | null;
  emergencyContact: CustomerProfile["emergencyContact"];
  preferences: CustomerProfile["preferences"];
}

function toAccount(user: PublicUser): CustomerAccount {
  return { id: user.id, email: user.email, fullName: user.fullName };
}

function toFullProfile(user: PublicUser, profile: CustomerProfile | null): CustomerFullProfile {
  return {
    ...toAccount(user),
    phone: profile?.phone ?? null,
    dateOfBirth: profile?.dateOfBirth ?? null,
    nationality: profile?.nationality ?? null,
    passportNumber: profile?.passportNumber ?? null,
    passportExpiry: profile?.passportExpiry ?? null,
    passportCountry: profile?.passportCountry ?? null,
    emergencyContact: profile?.emergencyContact ?? null,
    preferences: profile?.preferences ?? null,
  };
}

/**
 * Owns every read/write of "my account" — never lets a raw request body
 * reach `@/modules/auth`'s `UserService.update()` (which also accepts
 * `isActive`); only `fullName` is ever extracted and forwarded.
 */
export class CustomerProfileService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly profiles: CustomerProfileRepository
  ) {
    super(context);
  }

  async getAccount(userId: string): Promise<Result<CustomerAccount, AppError>> {
    const user = await getUserHandler(userId);
    if (isErr(user)) return user;
    return ok(toAccount(user.value));
  }

  async updateAccount(userId: string, input: unknown): Promise<Result<CustomerAccount, AppError>> {
    const validated = validateUpdateMe(input);
    if (isErr(validated)) return validated;
    return this.applyAccountUpdate(userId, validated.value);
  }

  private async applyAccountUpdate(userId: string, value: UpdateMeInput): Promise<Result<CustomerAccount, AppError>> {
    const updated = await getUserService().update(userId, { fullName: value.fullName });
    if (isErr(updated)) return updated;
    return ok(toAccount(toPublicUser(updated.value)));
  }

  async getFullProfile(userId: string): Promise<Result<CustomerFullProfile, AppError>> {
    const user = await getUserHandler(userId);
    if (isErr(user)) return user;
    const profile = await this.profiles.findByUserId(userId);
    if (isErr(profile)) return profile;
    return ok(toFullProfile(user.value, profile.value));
  }

  async updateFullProfile(userId: string, input: unknown): Promise<Result<CustomerFullProfile, AppError>> {
    const validated = validateUpdateCustomerProfile(input);
    if (isErr(validated)) return validated;
    return this.applyFullProfileUpdate(userId, validated.value);
  }

  private async applyFullProfileUpdate(userId: string, value: UpdateCustomerProfileInput): Promise<Result<CustomerFullProfile, AppError>> {
    if (value.fullName !== undefined) {
      const updated = await getUserService().update(userId, { fullName: value.fullName });
      if (isErr(updated)) return updated;
    }

    const { fullName: _fullName, ...profileFields } = value;
    const profile = await this.profiles.upsert(userId, profileFields);
    if (isErr(profile)) return profile;

    const user = await getUserHandler(userId);
    if (isErr(user)) return user;
    return ok(toFullProfile(user.value, profile.value));
  }
}

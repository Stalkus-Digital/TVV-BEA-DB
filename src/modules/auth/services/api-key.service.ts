import { randomBytes, createHash } from "node:crypto";
import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { ApiKey } from "../types/api-key";
import type { ApiKeyRepository } from "../repositories/api-key.repository";
import { validateCreateApiKey } from "../validation/api-key.validation";
import type { RoleService } from "../roles/role.service";

const KEY_PREFIX_LENGTH = 8;

/** Machine-to-machine access — an ApiKey is authenticated the same way a JWT is verified (see middleware/auth-guard.ts), just via a different credential. */
export class ApiKeyService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly apiKeys: ApiKeyRepository,
    private readonly roleService: RoleService
  ) {
    super(context);
  }

  async list(): Promise<Result<ApiKey[], AppError>> {
    return this.apiKeys.findAll();
  }

  /** Returns the ApiKey record AND the one-time-visible raw key — the raw value is never persisted or retrievable again after this call. */
  async create(input: unknown): Promise<Result<{ apiKey: ApiKey; rawKey: string }, AppError>> {
    const validated = validateCreateApiKey(input);
    if (isErr(validated)) return validated;
    const value = validated.value;

    const role = await this.roleService.getById(value.roleId);
    if (isErr(role)) return role;

    const secret = randomBytes(24).toString("hex");
    const keyPrefix = `tvv_${secret.slice(0, KEY_PREFIX_LENGTH)}`;
    const rawKey = `${keyPrefix}_${secret}`;
    const keyHash = createHash("sha256").update(rawKey).digest("hex");

    const created = await this.apiKeys.create({
      name: value.name,
      keyPrefix,
      keyHash,
      roleId: value.roleId,
      isActive: true,
      lastUsedAt: null,
      expiresAt: value.expiresAt,
      revokedAt: null,
      createdAt: new Date().toISOString(),
    });
    if (isErr(created)) return created;

    this.logger.info("API key created", { id: created.value.id, name: value.name, role: role.value.name });
    return ok({ apiKey: created.value, rawKey });
  }

  async revoke(id: string): Promise<Result<ApiKey, AppError>> {
    const existing = await this.apiKeys.findById(id);
    if (isErr(existing)) return existing;
    if (!existing.value) return err(new NotFoundError(`API key "${id}" not found`));
    return this.apiKeys.update(id, { isActive: false, revokedAt: new Date().toISOString() });
  }

  /**
   * Used by middleware/auth-guard.ts to authenticate a request bearing an
   * API key instead of a JWT. Scans every key and compares hashes in
   * application code, same shape this method always had (unchanged from
   * the in-memory version, per this sprint's "business logic must not
   * change") — see docs/23_DATABASE_MIGRATION.md's Performance Notes for
   * why a direct `keyHash` lookup (it's @unique in the schema) would be
   * strictly better and is a candidate for a future, explicitly-scoped
   * optimization pass, not assumed here.
   */
  async verify(rawKey: string): Promise<Result<ApiKey, AppError>> {
    const keyHash = createHash("sha256").update(rawKey).digest("hex");
    const allKeys = await this.apiKeys.findAll();
    if (isErr(allKeys)) return allKeys;
    const match = allKeys.value.find((k) => k.keyHash === keyHash);
    if (!match) return err(new NotFoundError("Invalid API key"));
    if (!match.isActive || match.revokedAt) return err(new NotFoundError("API key has been revoked"));
    if (match.expiresAt && new Date(match.expiresAt).getTime() < Date.now()) return err(new NotFoundError("API key has expired"));

    await this.apiKeys.update(match.id, { lastUsedAt: new Date().toISOString() });
    return ok(match);
  }
}

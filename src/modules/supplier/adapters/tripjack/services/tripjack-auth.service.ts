import { err, ok, type Result } from "@/shared/types";
import { InternalError, TimeoutError, UnauthorizedError, type AppError } from "@/shared/errors";
import type { Logger } from "@/shared/logger";
import type { TripJackConfig } from "../config/tripjack.config";
import { TripJackErrorHandler } from "./tripjack-error-handler";
import type { TripJackAuthLoginRequestDTO, TripJackAuthLoginResponseDTO } from "../dto";

/** Refresh this many ms before the token's actual expiry, so a call in flight never races a just-expired token. */
const TOKEN_REFRESH_BUFFER_MS = 60_000;

interface CachedToken {
  token: string;
  expiresAt: number;
}

/**
 * Real login/token-management flow (Sprint 17) — no live call existed
 * before this. `TRIPJACK_TOKEN` (already read by `TripJackConfig`) is
 * treated as an optional pre-provisioned static API key: some TripJack
 * accounts issue one of these instead of a login-exchange flow. When it's
 * set, it's used directly and no login call is ever made; otherwise this
 * exchanges Agency ID / User ID / Password for a session token and caches
 * it in memory, refreshing automatically once it's within
 * `TOKEN_REFRESH_BUFFER_MS` of expiring. Both the login endpoint path and
 * the response shape are provisional (no real TripJack API docs
 * consulted — see docs/10's Remaining TODOs); the login exchange itself is
 * a single, un-retried, timeout-bounded call — if it fails inside a
 * dispatch made through the Supplier Runtime, the Runtime's own retry
 * naturally retries this too, since every client method calls
 * `getToken()` fresh on every attempt.
 */
export class TripJackAuth {
  private cached: CachedToken | null = null;
  private readonly errorHandler = new TripJackErrorHandler();

  constructor(
    private readonly config: TripJackConfig,
    private readonly logger: Logger
  ) {}

  /** Doubles as "Credential Validation" when called from `health()` — a successful token (static or freshly logged in) IS the validation. */
  async getToken(): Promise<Result<string, AppError>> {
    const staticToken = this.config.get("token");
    if (staticToken) return ok(staticToken);

    if (!this.config.isConfigured()) {
      return err(new UnauthorizedError("TripJack credentials are not configured (TRIPJACK_AGENCY_ID/USER_ID/PASSWORD or TRIPJACK_TOKEN)"));
    }

    if (this.cached && this.cached.expiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS) {
      return ok(this.cached.token);
    }

    return this.login();
  }

  /** Test-only escape hatch — forces the next `getToken()` call to re-authenticate rather than use a cached token. */
  invalidate(): void {
    this.cached = null;
  }

  private async login(): Promise<Result<string, AppError>> {
    this.logger.info("TripJack auth token requested", { agencyId: this.config.get("agencyId") });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.get("timeoutMs"));

    try {
      const payload: TripJackAuthLoginRequestDTO = {
        agencyId: this.config.get("agencyId"),
        userId: this.config.get("userId"),
        password: this.config.get("password"),
      };

      const response = await fetch(`${this.config.get("apiUrl")}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        return err(this.errorHandler.toAppError({ statusCode: response.status, message: this.extractMessage(body) }));
      }

      const parsed = this.parseLoginResponse(body);
      if (!parsed) return err(new InternalError("TripJack auth response was missing token/expiresInSeconds"));

      this.cached = { token: parsed.token, expiresAt: Date.now() + parsed.expiresInSeconds * 1000 };
      this.logger.info("TripJack auth token obtained", { expiresInSeconds: parsed.expiresInSeconds });
      return ok(this.cached.token);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return err(new TimeoutError("TripJack auth request timed out"));
      }
      return err(new InternalError(`TripJack auth request failed: ${error instanceof Error ? error.message : String(error)}`, { source: "tripjack" }));
    } finally {
      clearTimeout(timer);
    }
  }

  private parseLoginResponse(body: unknown): TripJackAuthLoginResponseDTO | null {
    if (typeof body !== "object" || body === null) return null;
    const record = body as Record<string, unknown>;
    if (typeof record.token !== "string" || typeof record.expiresInSeconds !== "number") return null;
    return { token: record.token, expiresInSeconds: record.expiresInSeconds };
  }

  private extractMessage(body: unknown): string | undefined {
    if (typeof body === "object" && body !== null && "message" in body && typeof (body as Record<string, unknown>).message === "string") {
      return (body as Record<string, unknown>).message as string;
    }
    return undefined;
  }
}

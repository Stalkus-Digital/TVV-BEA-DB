import { err, isErr, ok, type Result } from "@/shared/types";
import { BaseService, type ServiceContext } from "@/shared/services";
import { NotFoundError, type AppError } from "@/shared/errors";
import type { PackageRule, RuleEvaluationResult } from "../types/package-rule";
import type { PackageRuleRepository } from "../repositories/package-rule.repository";
import { validateEvaluateRuleRequest, validateUpdateRule } from "../validation/package-rule.validation";
import { evaluateRule } from "./rule-evaluator";

export class PackageRuleService extends BaseService {
  constructor(
    context: ServiceContext,
    private readonly repository: PackageRuleRepository
  ) {
    super(context);
  }

  async getByPackage(packageId: string): Promise<Result<PackageRule, AppError>> {
    const result = await this.repository.findByPackage(packageId);
    if (isErr(result)) return result;
    if (!result.value) return err(new NotFoundError(`Rules for package "${packageId}" not found`));
    return ok(result.value);
  }

  /** Upsert — a package always has exactly one rule record. */
  async upsert(packageId: string, input: unknown): Promise<Result<PackageRule, AppError>> {
    const validated = validateUpdateRule(input);
    if (isErr(validated)) return validated;

    const existing = await this.repository.findByPackage(packageId);
    if (isErr(existing)) return existing;

    const now = new Date().toISOString();
    if (existing.value) {
      this.logger.info("Updating package rules", { packageId });
      return this.repository.update(existing.value.id, { ...validated.value, updatedAt: now });
    }

    this.logger.info("Creating package rules", { packageId });
    return this.repository.create({ packageId, ...validated.value, createdAt: now, updatedAt: now });
  }

  async evaluate(packageId: string, input: unknown): Promise<Result<RuleEvaluationResult, AppError>> {
    const validated = validateEvaluateRuleRequest(input);
    if (isErr(validated)) return validated;

    const rule = await this.getByPackage(packageId);
    if (isErr(rule)) return rule;

    return ok(evaluateRule(rule.value, validated.value));
  }
}

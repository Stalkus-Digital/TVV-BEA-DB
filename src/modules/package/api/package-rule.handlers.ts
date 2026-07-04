import type { AppError } from "@/shared/errors";
import type { Result } from "@/shared/types";
import { getPackageRuleService } from "../module";
import type { PackageRule, RuleEvaluationResult } from "../types/package-rule";

export async function getPackageRuleHandler(packageId: string): Promise<Result<PackageRule, AppError>> {
  return getPackageRuleService().getByPackage(packageId);
}

export async function upsertPackageRuleHandler(packageId: string, body: unknown): Promise<Result<PackageRule, AppError>> {
  return getPackageRuleService().upsert(packageId, body);
}

export async function evaluatePackageRuleHandler(packageId: string, body: unknown): Promise<Result<RuleEvaluationResult, AppError>> {
  return getPackageRuleService().evaluate(packageId, body);
}

import { prisma } from "@/shared/database/prisma-client";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, AppError } from "@/shared/errors";

export class CmsConfigService {
  private static instance: CmsConfigService;

  private constructor() {}

  static getInstance(): CmsConfigService {
    if (!CmsConfigService.instance) {
      CmsConfigService.instance = new CmsConfigService();
    }
    return CmsConfigService.instance;
  }

  async getConfig(key: string): Promise<Result<any, AppError>> {
    try {
      const config = await prisma.cmsConfig.findUnique({
        where: { key }
      });
      return ok(config?.value ?? null);
    } catch (error) {
      return err(new InternalError(`Failed to read CMS config ${key}`, { cause: error }));
    }
  }

  async setConfig(key: string, value: any): Promise<Result<void, AppError>> {
    try {
      await prisma.cmsConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
      return ok(undefined);
    } catch (error) {
      return err(new InternalError(`Failed to save CMS config ${key}`, { cause: error }));
    }
  }
}

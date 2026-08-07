import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import { Prisma } from "@/generated/prisma/client";
import { randomUUID } from "crypto";

/**
 * DTO aligned with the actual LandingPage schema:
 *  - blocks: Json   (required — contains all page section data)
 *  - seo:    Json?  (optional — SEO metadata overrides)
 *
 * The old DTO fields (heroSection / packages / faqSection) were removed
 * when the schema was refactored to use a single flexible `blocks` column.
 */
export interface CreateLandingPageDto {
  title: string;
  slug: string;
  destinationId?: string;
  template?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: string;
  blocks?: Record<string, unknown>;
  seo?: Record<string, unknown> | null;
}

export class LandingPageService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async getAll(): Promise<Result<any[], AppError>> {
    try {
      const pages = await prisma.landingPage.findMany({
        include: { destination: { select: { slug: true, name: true } } },
        orderBy: { createdAt: "desc" },
      });
      return ok(pages);
    } catch {
      return err(new InternalError("Failed to fetch landing pages"));
    }
  }

  async getBySlug(slug: string): Promise<Result<any, AppError>> {
    try {
      const page = await prisma.landingPage.findUnique({ 
        where: { slug },
        include: { destination: { select: { slug: true, name: true } } }
      });
      if (!page) return err(new NotFoundError("Landing page not found"));
      return ok(page);
    } catch {
      return err(new InternalError("Failed to fetch landing page"));
    }
  }

  async create(data: CreateLandingPageDto): Promise<Result<any, AppError>> {
    try {
      const page = await prisma.landingPage.create({
        data: {
          id: randomUUID(),
          title: data.title,
          slug: data.slug,
          destinationId: data.destinationId,
          template: data.template ?? "destination_v1",
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          status: data.status ?? "DRAFT",
          blocks: data.blocks ? (data.blocks as Prisma.InputJsonValue) : Prisma.JsonNull,
          seo: data.seo ? (data.seo as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });
      return ok(page);
    } catch {
      return err(new InternalError("Failed to create landing page"));
    }
  }

  async update(id: string, data: Partial<CreateLandingPageDto>): Promise<Result<any, AppError>> {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.destinationId !== undefined) updateData.destinationId = data.destinationId;
      if (data.template !== undefined) updateData.template = data.template;
      if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
      if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.blocks !== undefined) updateData.blocks = data.blocks ? (data.blocks as Prisma.InputJsonValue) : Prisma.JsonNull;
      if (data.seo !== undefined) updateData.seo = data.seo ? (data.seo as Prisma.InputJsonValue) : Prisma.JsonNull;

      const page = await prisma.landingPage.update({
        where: { id },
        data: updateData,
      });
      return ok(page);
    } catch {
      return err(new InternalError("Failed to update landing page"));
    }
  }

  async compileToHtml(slugOrId: string): Promise<Result<string, AppError>> {
    try {
      const pageResult = await this.getBySlug(slugOrId);
      if (!pageResult.ok) return pageResult;
      const page = pageResult.value;

      // blocks is a flexible JSON column — render a lightweight preview
      const blocks = Array.isArray(page.blocks) ? page.blocks : [];
      const blocksHtml = blocks
        .map((block: any) => `<section data-type="${block.type ?? "unknown"}">${block.title ?? ""}</section>`)
        .join("");

      const html = `<!DOCTYPE html>
<html>
<head>
  <title>${page.title}</title>
  <meta charset="utf-8">
  <style>body { font-family: sans-serif; }</style>
</head>
<body>
  ${blocksHtml}
</body>
</html>`;

      return ok(html);
    } catch {
      return err(new InternalError("Failed to compile landing page"));
    }
  }
}

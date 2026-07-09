import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, NotFoundError, type AppError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma-client";
import { randomUUID } from "crypto";

export interface CreateLandingPageDto {
  title: string;
  slug: string;
  heroSection: any;
  packages: any;
  faqSection: any;
}

export class LandingPageService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async getAll(): Promise<Result<any[], AppError>> {
    try {

      const pages = await prisma.landingPage.findMany({
        orderBy: { createdAt: "desc" },
      });
      return ok(pages);
    } catch (error) {
      return err(new InternalError("Failed to fetch landing pages"));
    }
  }

  async getBySlug(slug: string): Promise<Result<any, AppError>> {
    try {

      const page = await prisma.landingPage.findUnique({
        where: { slug },
      });
      if (!page) return err(new NotFoundError("Landing page not found"));
      return ok(page);
    } catch (error) {
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
          heroSection: data.heroSection || {},
          packages: data.packages || [],
          faqSection: data.faqSection || [],
        },
      });
      return ok(page);
    } catch (error) {
      return err(new InternalError("Failed to create landing page"));
    }
  }

  async update(id: string, data: Partial<CreateLandingPageDto>): Promise<Result<any, AppError>> {
    try {

      const page = await prisma.landingPage.update({
        where: { id },
        data,
      });
      return ok(page);
    } catch (error) {
      return err(new InternalError("Failed to update landing page"));
    }
  }

  async compileToHtml(id: string): Promise<Result<string, AppError>> {
    try {
      const pageResult = await this.getBySlug(id); // assuming slug is passed for compile
      if (!pageResult.ok) return pageResult;
      const page = pageResult.value;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${page.title}</title>
          <meta charset="utf-8">
          <style>body { font-family: sans-serif; }</style>
        </head>
        <body>
          <div class="hero" style="background-image: url('${page.heroSection?.backgroundImage || ""}')">
            <h1>${page.heroSection?.headline || page.title}</h1>
            <p>${page.heroSection?.subheadline || ""}</p>
          </div>
          <div class="packages">
            ${Array.isArray(page.packages) ? page.packages.map((p: any) => `
              <div class="package">
                <h2>${p.title}</h2>
                <p>₹${p.price}</p>
              </div>
            `).join("") : ""}
          </div>
        </body>
        </html>
      `;
      return ok(html);
    } catch (error) {
      return err(new InternalError("Failed to compile landing page"));
    }
  }
}

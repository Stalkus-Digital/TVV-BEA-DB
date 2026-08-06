/**
 * Shared service for CMS content operations (Pages and Guides).
 * Centralises validation (slug uniqueness, required fields) and
 * Prisma persistence so the route handlers stay thin.
 */
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CmsPageSaveInput {
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  content: Record<string, unknown>;
}

export interface CmsGuideSaveInput {
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  content: Record<string, unknown>;
  authorId?: string | null;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateSlug(slug: string): void {
  if (!slug || !slug.trim()) {
    throw new Error("Slug is required");
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Slug must contain only lowercase letters, numbers, and hyphens");
  }
}

function validateTitle(title: string): void {
  if (!title || !title.trim()) {
    throw new Error("Title is required");
  }
}

// ─── CmsPage operations ───────────────────────────────────────────────────────

export async function createCmsPage(input: CmsPageSaveInput) {
  validateTitle(input.title);
  validateSlug(input.slug);

  const existing = await prisma.cmsPage.findFirst({ where: { slug: input.slug } });
  if (existing) {
    throw new Error(`A page with slug "${input.slug}" already exists`);
  }

  return prisma.cmsPage.create({
    data: {
      title: input.title.trim(),
      slug: input.slug.trim(),
      content: input.content as Prisma.InputJsonValue,
      status: input.status,
    },
  });
}

export async function updateCmsPage(id: string, input: CmsPageSaveInput) {
  validateTitle(input.title);
  validateSlug(input.slug);

  // Check slug uniqueness — exclude the current record
  const conflicting = await prisma.cmsPage.findFirst({
    where: { slug: input.slug, NOT: { id } },
  });
  if (conflicting) {
    throw new Error(`A page with slug "${input.slug}" already exists`);
  }

  return prisma.cmsPage.update({
    where: { id },
    data: {
      title: input.title.trim(),
      slug: input.slug.trim(),
      content: input.content as Prisma.InputJsonValue,
      status: input.status,
    },
  });
}

export async function deleteCmsPage(id: string) {
  return prisma.cmsPage.delete({ where: { id } });
}

// ─── CmsGuide operations ──────────────────────────────────────────────────────

export async function createCmsGuide(input: CmsGuideSaveInput) {
  validateTitle(input.title);
  validateSlug(input.slug);

  const existing = await prisma.cmsGuide.findFirst({ where: { slug: input.slug } });
  if (existing) {
    throw new Error(`A guide with slug "${input.slug}" already exists`);
  }

  return prisma.cmsGuide.create({
    data: {
      title: input.title.trim(),
      slug: input.slug.trim(),
      content: input.content as Prisma.InputJsonValue,
      status: input.status,
      authorId: input.authorId ?? null,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    },
  });
}

export async function updateCmsGuide(id: string, input: CmsGuideSaveInput) {
  validateTitle(input.title);
  validateSlug(input.slug);

  // Check slug uniqueness — exclude the current record
  const conflicting = await prisma.cmsGuide.findFirst({
    where: { slug: input.slug, NOT: { id } },
  });
  if (conflicting) {
    throw new Error(`A guide with slug "${input.slug}" already exists`);
  }

  return prisma.cmsGuide.update({
    where: { id },
    data: {
      title: input.title.trim(),
      slug: input.slug.trim(),
      content: input.content as Prisma.InputJsonValue,
      status: input.status,
      authorId: input.authorId ?? null,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    },
  });
}

export async function deleteCmsGuide(id: string) {
  return prisma.cmsGuide.delete({ where: { id } });
}

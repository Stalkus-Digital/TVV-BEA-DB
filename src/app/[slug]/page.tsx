import { notFound } from "next/navigation";
import { prisma } from "@/shared/database/prisma-client";
import type { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const page = await prisma.landingPage.findUnique({ where: { slug } }) as any;
  if (page) {
    return {
      title: page.seoTitle || page.title || "The Vacation Voice",
      description: page.seoDescription || "",
    };
  }

  return { title: "Not Found" };
}

/**
 * CRM [slug] route — was the old destination landing page renderer.
 * Fake block-based renderer removed. Custom landing pages are now served
 * by the public frontend at /lp/[slug]. This route is no longer needed
 * in the CRM app — redirect to 404.
 */
export default async function SlugPage({ params }: PageProps) {
  notFound();
}

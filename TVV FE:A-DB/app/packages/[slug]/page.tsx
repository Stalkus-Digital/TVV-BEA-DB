import { packagesFeatureService } from "@/features/packages";
import { PackageDetailPage } from "@/features/packages";
import { packageStaticSlugs } from "@/lib/ssg/static-paths";
import { buildMetadata } from "@/lib/seo";
import { formatINR } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const slugs = await packageStaticSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await packagesFeatureService.getBySlug(slug);
  if (!res.ok || !res.data) {
    return buildMetadata({ title: "Journey not found", description: "", path: `/packages/${slug}` });
  }

  const pkg = res.data;
  return buildMetadata({
    title: `${pkg.title} — ${pkg.durationDays}D/${pkg.durationNights}N`,
    description: `${pkg.title}. ${pkg.durationDays} days, ${pkg.durationNights} nights. Curated by TVV specialists. From ${formatINR(pkg.pricing.perAdult)} per adult.`,
    path: `/packages/${pkg.slug}`,
    image: pkg.hero.image,
    keywords: [pkg.destination, pkg.title, "TVV tour package", ...(pkg.themes ?? [])],
  });
}

export const revalidate = 600;

export default async function PackageDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PackageDetailPage slug={slug} />;
}

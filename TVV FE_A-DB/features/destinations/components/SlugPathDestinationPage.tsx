import Link from "next/link";
import Image from "next/image";
import { buildBreadcrumbJsonLd, buildDestinationJsonLd } from "@/lib/hierarchy";
import { JsonLd } from "@/components/ui/JsonLd";
import { DestinationBreadcrumb } from "./DestinationBreadcrumb";
import { DestinationChildGrid } from "./DestinationChildGrid";
import { EditorialBodySection } from "./EditorialBodySection";
import { destinationsFeatureService } from "../services/destinations.service";
import { destinationSlugPathHref } from "../paths";
import type { DestinationDetail } from "../types";

interface SlugPathDestinationPageProps {
  destination: DestinationDetail;
  breadcrumbs: { label: string; href: string }[];
}

export async function SlugPathDestinationPage({
  destination,
  breadcrumbs,
}: SlugPathDestinationPageProps) {
  const children = await destinationsFeatureService.listPublishedChildren(destination.id);

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-navy text-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        {(destination.heroImageUrl ?? destination.imageUrl) && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={destination.heroImageUrl ?? destination.imageUrl!}
              alt={destination.name}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/40 to-navy" />
          </div>
        )}
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <DestinationBreadcrumb items={breadcrumbs} />
          <p className="text-[12px] uppercase tracking-[0.2em] text-gold">
            {destination.level.replace("_", " ").toLowerCase()}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight text-balance">
            {destination.name}
          </h1>
          {destination.metaDescription && (
            <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/85">
              {destination.metaDescription}
            </p>
          )}
        </div>
      </section>

      {destination.seoContent && <EditorialBodySection html={destination.seoContent} />}

      {children.length > 0 && (
        <DestinationChildGrid
          title={`Inside ${destination.name}`}
          items={children.map((child) => ({
            id: child.id.toString(),
            name: child.name,
            href: destinationSlugPathHref(child.slugPath),
            image: child.heroImageUrl ?? child.imageUrl ?? null,
            eyebrow: child.level.replace("_", " ").toLowerCase(),
          }))}
        />
      )}

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 text-center">
          <p className="text-[15px] text-ink-secondary">
            Prefer a curated itinerary?{" "}
            <Link href="/contact" className="text-teal hover:underline">
              Talk to a specialist
            </Link>
          </p>
        </div>
      </section>

      <JsonLd
        data={[
          buildBreadcrumbJsonLd(breadcrumbs),
          buildDestinationJsonLd({
            name: destination.name,
            description: destination.metaDescription,
            url: destinationSlugPathHref(destination.slugPath),
            imageUrl: destination.heroImageUrl ?? destination.imageUrl,
          }),
        ]}
      />
    </main>
  );
}

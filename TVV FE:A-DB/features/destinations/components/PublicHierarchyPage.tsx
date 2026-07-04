import {
  buildCategoryPath,
  buildCountryPath,
  buildDestinationPath,
  buildDestinationJsonLd,
  buildBreadcrumbJsonLd,
  hierarchyDb,
  type HierarchyResolution,
} from "@/lib/hierarchy";
import { JsonLd } from "@/components/ui/JsonLd";
import { DestinationChildGrid } from "./DestinationChildGrid";
import { DestinationHero } from "./DestinationHero";
import { EditorialBodySection } from "./EditorialBodySection";
import {
  FerriesAndFlightsRail,
  GuidesRail,
  HotelsRail,
  PackagesRail,
} from "./DestinationRails";
import { destinationsFeatureService } from "../services/destinations.service";
import type { BreadcrumbItem } from "../types";

interface PublicHierarchyPageProps {
  resolution: Exclude<HierarchyResolution, { kind: "not_found" }>;
  crumbs: BreadcrumbItem[];
}

export async function PublicHierarchyPage({ resolution, crumbs }: PublicHierarchyPageProps) {
  return (
    <main className="bg-cream">
      {resolution.kind === "country" && (
        <CountryLanding resolution={resolution} crumbs={crumbs} />
      )}
      {resolution.kind === "destination" && (
        <DestinationLanding resolution={resolution} crumbs={crumbs} />
      )}
      {resolution.kind === "category" && (
        <CategoryLanding resolution={resolution} crumbs={crumbs} />
      )}
    </main>
  );
}

async function CountryLanding({
  resolution,
  crumbs,
}: {
  resolution: Extract<HierarchyResolution, { kind: "country" }>;
  crumbs: BreadcrumbItem[];
}) {
  const { country } = resolution;

  const destinations = await hierarchyDb.destination.findMany({
    where: { parentId: BigInt(country.id), level: "DESTINATION", status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, heroImageUrl: true, imageUrl: true },
  });

  return (
    <>
      <DestinationHero node={country} crumbs={crumbs} kindLabel="Country" />
      {country.seoContent && <EditorialBodySection html={country.seoContent} />}
      <DestinationChildGrid
        title={`Destinations in ${country.name}`}
        emptyHint="More destinations are being curated."
        items={destinations.map((d) => ({
          id: d.id.toString(),
          name: d.name,
          href: buildDestinationPath({ country: country.slug, destination: d.slug }),
          image: d.heroImageUrl ?? d.imageUrl ?? null,
          eyebrow: "Destination",
        }))}
      />
      <JsonLd
        data={[
          buildBreadcrumbJsonLd(crumbs),
          buildDestinationJsonLd({
            name: country.name,
            description: country.metaDescription,
            url: crumbs.at(-1)?.href ?? buildCountryPath({ country: country.slug }),
          }),
        ]}
      />
    </>
  );
}

async function DestinationLanding({
  resolution,
  crumbs,
}: {
  resolution: Extract<HierarchyResolution, { kind: "destination" }>;
  crumbs: BreadcrumbItem[];
}) {
  const { country, destination } = resolution;

  const [categories, related] = await Promise.all([
    destinationsFeatureService.listCategoriesForDestination(BigInt(destination.id)),
    destinationsFeatureService.fetchDestinationRelatedContent(destination.id),
  ]);

  return (
    <>
      <DestinationHero node={destination} crumbs={crumbs} kindLabel="Destination" />
      {destination.seoContent && <EditorialBodySection html={destination.seoContent} />}
      {categories.length > 0 && (
        <DestinationChildGrid
          title={`Plan your trip to ${destination.name}`}
          items={categories.map((c) => ({
            id: c.id,
            name: c.name,
            href: buildCategoryPath({
              country: country.slug,
              destination: destination.slug,
              category: c.slug,
            }),
            image: c.heroImageUrl,
            eyebrow: "Collection",
          }))}
        />
      )}
      <PackagesRail title={`Packages in ${destination.name}`} packages={related.packages} />
      <HotelsRail title={`Hotels in ${destination.name}`} hotels={related.hotels} />
      <GuidesRail title={`${destination.name} travel guides`} guides={related.guides} />
      <FerriesAndFlightsRail
        destinationName={destination.name}
        ferries={related.ferries}
        flights={related.flights}
      />
      <JsonLd
        data={[
          buildBreadcrumbJsonLd(crumbs),
          buildDestinationJsonLd({
            name: destination.name,
            description: destination.metaDescription,
            url: buildDestinationPath({ country: country.slug, destination: destination.slug }),
            imageUrl: destination.heroImageUrl,
          }),
        ]}
      />
    </>
  );
}

async function CategoryLanding({
  resolution,
  crumbs,
}: {
  resolution: Extract<HierarchyResolution, { kind: "category" }>;
  crumbs: BreadcrumbItem[];
}) {
  const { destination, category } = resolution;
  const packages = await destinationsFeatureService.listPackagesForCategory(category.id);

  return (
    <>
      <DestinationHero node={category} crumbs={crumbs} kindLabel="Collection" />
      {category.seoContent && <EditorialBodySection html={category.seoContent} />}
      {category.description && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-3xl px-6 lg:px-0">
            <p className="text-[18px] leading-[1.8] text-ink-secondary">{category.description}</p>
          </div>
        </section>
      )}
      <PackagesRail
        title={`${category.name} in ${destination.name}`}
        emptyHint="No packages tagged to this collection yet."
        packages={packages}
      />
      <JsonLd data={buildBreadcrumbJsonLd(crumbs)} />
    </>
  );
}

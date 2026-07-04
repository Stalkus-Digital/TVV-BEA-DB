import { PackageCard } from "@/components/cards/PackageCard";
import { CardRail, CardRailItem } from "@/components/sections/CardRail";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import type { Package } from "@/lib/models";
import { packageListingPath } from "../paths";

interface RelatedPackagesRailProps {
  packages: Package[];
  region: Package["region"];
}

export function RelatedPackagesRail({ packages, region }: RelatedPackagesRailProps) {
  if (packages.length === 0) return null;

  return (
    <Section tone="white" className="py-24">
      <Container>
        <SectionHeader
          eyebrow="You might also like"
          title="Similar journeys, curated for you."
          viewAllHref={packageListingPath(region)}
          viewAllLabel="Browse more"
        />
        <div className="mt-12">
          <CardRail>
            {packages.map((pkg) => (
              <CardRailItem key={pkg.slug}>
                <PackageCard data={pkg} />
              </CardRailItem>
            ))}
          </CardRail>
        </div>
      </Container>
    </Section>
  );
}

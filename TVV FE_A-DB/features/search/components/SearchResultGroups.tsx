import Link from "next/link";
import { PackageCard } from "@/components/cards/PackageCard";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { GuideCard } from "@/components/cards/GuideCard";
import { SectionHeader } from "@/components/ui/Section";
import type { SearchResults } from "../types";

interface SearchResultGroupsProps {
  results: SearchResults;
}

export function SearchResultGroups({ results }: SearchResultGroupsProps) {
  const { packages, destinations, guides } = results;

  return (
    <div className="space-y-14">
      {packages.length > 0 && (
        <div>
          <SectionHeader
            eyebrow="Journeys"
            title={`${packages.length} matching itinerar${packages.length === 1 ? "y" : "ies"}`}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.slug} data={pkg} />
            ))}
          </div>
        </div>
      )}

      {destinations.length > 0 && (
        <div>
          <SectionHeader
            eyebrow="Destinations"
            title={`${destinations.length} matching destination${destinations.length === 1 ? "" : "s"}`}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((dest) => (
              <DestinationCard key={dest.slug} destination={dest} />
            ))}
          </div>
        </div>
      )}

      {guides.length > 0 && (
        <div>
          <SectionHeader
            eyebrow="Guides"
            title={`${guides.length} matching guide${guides.length === 1 ? "" : "s"}`}
          />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center">
      <p className="font-display text-[22px] text-ink">No exact matches for &ldquo;{query}&rdquo;.</p>
      <p className="mt-2 text-[14px] text-ink-secondary">
        Try a broader term, or write to a specialist —{" "}
        <Link href="/contact" className="text-teal hover:underline">
          we&apos;ll build it for you
        </Link>
        .
      </p>
    </div>
  );
}

export function SearchErrorState() {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger-bg/50 p-12 text-center">
      <p className="font-display text-[22px] text-ink">Search is briefly unavailable.</p>
      <p className="mt-2 text-[14px] text-ink-secondary">
        Try again in a moment, or{" "}
        <Link href="/contact" className="text-teal hover:underline">
          talk to a specialist
        </Link>
        .
      </p>
    </div>
  );
}

export function SearchPrompt() {
  return (
    <p className="text-[15px] text-ink-secondary">
      Type a destination, theme, or country into the search bar above.
    </p>
  );
}

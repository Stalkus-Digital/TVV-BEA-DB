"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/Section";
import { PackageCard } from "@/components/cards/PackageCard";
import { FilterChips } from "@/components/ui/FilterChips";
import { CardRail, CardRailItem } from "./CardRail";
import type { Package } from "@/lib/models";

const filters = [
  { label: "All", value: "all" },
  { label: "Andaman", value: "andaman" },
  { label: "India", value: "domestic" },
  { label: "International", value: "international" },
  { label: "Luxury", value: "luxury" },
  { label: "Honeymoon", value: "honeymoon" },
];

interface FeaturedJourneysProps {
  packages: Package[];
}

export function FeaturedJourneys({ packages }: FeaturedJourneysProps) {
  const [filter, setFilter] = useState("all");

  const tours = useMemo(() => {
    if (!packages || packages.length === 0) return [];
    if (filter === "luxury") return packages.filter((p) => p.themes?.includes("luxury"));
    if (filter === "honeymoon") return packages.filter((p) => p.themes?.includes("honeymoon"));
    if (filter === "all") return packages.slice(0, 8);
    return packages.filter((p) => p.region === filter);
  }, [filter, packages]);

  return (
    <section className="bg-cream py-section">
      <Container>
        <SectionHeader
          eyebrow="Featured journeys"
          title="Itineraries our specialists actually recommend."
          description="A live shelf, refreshed weekly. Every itinerary is a starting point — yours will be redrawn around how you travel."
          viewAllHref="/packages/international"
          viewAllLabel="View all itineraries"
        />

        <div className="mb-12 border-b border-line">
          <FilterChips options={filters} defaultValue="all" onChange={setFilter} ariaLabel="Filter featured journeys" />
        </div>

        {tours.length === 0 ? (
          <p className="text-ink-muted">No journeys in this filter yet — try another thread.</p>
        ) : (
          <CardRail>
            {tours.map((t) => (
              <CardRailItem key={t.slug}>
                <PackageCard data={t} />
              </CardRailItem>
            ))}
          </CardRail>
        )}
      </Container>
    </section>
  );
}

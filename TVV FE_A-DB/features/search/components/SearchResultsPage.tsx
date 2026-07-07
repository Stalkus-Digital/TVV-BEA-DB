import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { searchFeatureService } from "../services/search.feature.service";
import { applySearchFilters } from "../utils/sort-results";
import { parseSearchFilters } from "../utils/parse-filters";
import { SearchBar } from "./SearchBar";
import { SearchFiltersBar } from "./SearchFilters";
import {
  SearchEmptyState,
  SearchErrorState,
  SearchPrompt,
  SearchResultGroups,
} from "./SearchResultGroups";

interface SearchResultsPageProps {
  query: string;
  sort?: string;
  type?: string;
}

async function SearchResultsBody({
  query,
  filters,
}: {
  query: string;
  filters: ReturnType<typeof parseSearchFilters>;
}) {
  const trimmed = query.trim();
  if (!trimmed) return <SearchPrompt />;

  const res = await searchFeatureService.query(trimmed);
  if (!res.ok) return <SearchErrorState />;

  const results = applySearchFilters(res.data, filters);
  if (results.totalCount === 0) return <SearchEmptyState query={trimmed} />;

  return <SearchResultGroups results={results} />;
}

export function SearchResultsPage({ query, sort, type }: SearchResultsPageProps) {
  const filters = parseSearchFilters({ sort, type });
  const trimmed = query.trim();

  return (
    <>
      <section className="bg-cream pb-8 pt-10">
        <Container>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
          <div className="mt-8 max-w-3xl">
            <p className="text-label uppercase text-teal">Search</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight tracking-tight text-ink">
              {trimmed ? (
                <>
                  Results for <span className="text-teal">&ldquo;{trimmed}&rdquo;</span>
                </>
              ) : (
                "Search journeys, destinations & guides"
              )}
            </h1>
            <div className="mt-8">
              <SearchBar defaultValue={trimmed} ctaLabel="Search" size="inline" />
            </div>
          </div>
        </Container>
      </section>

      <Section tone="cream" pad="default">
        <Container>
          <Suspense fallback={null}>
            <SearchFiltersBar query={trimmed} />
          </Suspense>
          <div className="mt-8">
            <Suspense fallback={<p className="text-ink-muted">Searching…</p>}>
              <SearchResultsBody query={query} filters={filters} />
            </Suspense>
          </div>
        </Container>
      </Section>

      <ConciergeCTA />
    </>
  );
}

import { SearchResultsPage } from "@/features/search";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Search",
  description: "Search journeys, destinations, and guides at The Vacation Voice.",
  path: "/search",
});

export default async function SearchRoute({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; type?: string }>;
}) {
  const { q = "", sort, type } = await searchParams;
  return <SearchResultsPage query={q} sort={sort} type={type} />;
}

import type { Metadata } from "next";
import { DestinationsIndex } from "@/features/destinations";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Destinations — Curated Regions & Countries",
  description:
    "Browse The Vacation Voice destination tree — specialist-planned regions, countries, and island collections.",
  path: "/destinations",
});

export default function DestinationsDirectoryPage() {
  return <DestinationsIndex />;
}

import { notFound } from "next/navigation";
import { prisma } from "@/shared/database/prisma-client";
import { DestinationHero } from "@/features/destination-landing/components/DestinationHero";
import { PackageShowcase } from "@/features/destination-landing/components/PackageShowcase";
import { ValueProposition } from "@/features/destination-landing/components/ValueProposition";
import { InclusionsExclusions } from "@/features/destination-landing/components/InclusionsExclusions";
import { ItineraryTimeline } from "@/features/destination-landing/components/ItineraryTimeline";
import { WhyBookSection } from "@/features/destination-landing/components/WhyBookSection";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = await prisma.destination.findUnique({
    where: { slug },
  });

  if (!destination) {
    return { title: "Not Found" };
  }

  const seo = destination.seo as any;

  return {
    title: seo?.metaTitle || `${destination.name} Holiday Packages | The Vacation Voice`,
    description: seo?.metaDescription || `Explore the best ${destination.name} holiday packages.`,
  };
}

export default async function DestinationLandingPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch Destination
  const destination = await prisma.destination.findUnique({
    where: { slug },
  }) as any;

  if (!destination) {
    notFound();
  }

  // 2. Fetch Packages for this destination
  const packages = await prisma.package.findMany({
    where: {
      destinationId: destination.id,
      status: "PUBLISHED",
      isTemplate: false,
    },
    take: 12,
  });

  const bestDeals = packages.slice(0, 6);
  const honeymoons = packages.slice(6, 12);

  // Parse gallery to get a background image
  const gallery = destination.gallery as any;
  const heroImage = gallery?.images?.[0] || "/placeholder-destination.jpg";

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <DestinationHero destination={destination} heroImage={heroImage} />
      
      {bestDeals.length > 0 && (
        <PackageShowcase 
          title={`Best ${destination.name} Deals`} 
          subtitle="Curated with expertise" 
          packages={bestDeals as any[]} 
        />
      )}

      {honeymoons.length > 0 && (
        <PackageShowcase 
          title="Romantic Escapes & Honeymoons" 
          subtitle="Make your special moments unforgettable with our curated couple packages." 
          packages={honeymoons as any[]} 
        />
      )}

      <ValueProposition />

      <InclusionsExclusions />

      <ItineraryTimeline destinationName={destination.name} />

      <WhyBookSection destinationName={destination.name} />
    </div>
  );
}

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

  // 1. First, check if a custom LandingPage exists for this slug
  const customLandingPage = await prisma.landingPage.findUnique({
    where: { slug }
  }) as any;

  // 2. Fetch Destination (Fallback or required for relations)
  const destination = await prisma.destination.findUnique({
    where: { slug },
  }) as any;

  if (!customLandingPage && !destination) {
    notFound();
  }

  // 3. Determine if we are rendering the custom CMS page or the basic Destination page
  const content = customLandingPage?.content || {};
  const heroSection = customLandingPage?.heroSection || {};
  
  // 4. Fetch Packages (from LandingPage slugs OR fallback to top Destination packages)
  let bestDeals: any[] = [];
  let honeymoons: any[] = [];

  if (customLandingPage && Array.isArray(customLandingPage.packages) && customLandingPage.packages.length > 0) {
    const customPackages = await prisma.package.findMany({
      where: { slug: { in: customLandingPage.packages }, status: "PUBLISHED" }
    });
    // Split for presentation
    bestDeals = customPackages.slice(0, 6);
    honeymoons = customPackages.slice(6, 12);
  } else if (destination) {
    const packages = await prisma.package.findMany({
      where: { destinationId: destination.id, status: "PUBLISHED", isTemplate: false },
      take: 12,
    });
    bestDeals = packages.slice(0, 6);
    honeymoons = packages.slice(6, 12);
  }

  // Parse gallery to get a background image
  const gallery = destination?.gallery as any;
  const heroImage = heroSection.imageUrl || gallery?.images?.[0] || "/placeholder-destination.jpg";
  const displayDestName = destination?.name || customLandingPage?.title || slug;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <DestinationHero 
        destination={{ name: displayDestName }} 
        heroImage={heroImage} 
        customHeadline={heroSection.headline}
        customSubheadline={heroSection.subheadline}
      />
      
      {bestDeals.length > 0 && (
        <PackageShowcase 
          title={`Best ${displayDestName} Deals`} 
          subtitle="Curated with expertise" 
          packages={bestDeals} 
        />
      )}

      {honeymoons.length > 0 && (
        <PackageShowcase 
          title="Romantic Escapes & Honeymoons" 
          subtitle="Make your special moments unforgettable with our curated couple packages." 
          packages={honeymoons} 
        />
      )}

      <ValueProposition 
        features={content.valueProposition} 
      />

      <InclusionsExclusions 
        inclusions={content.inclusions}
        exclusions={content.exclusions}
      />

      <ItineraryTimeline 
        destinationName={displayDestName}
        timeline={content.timeline}
      />

      <WhyBookSection 
        destinationName={displayDestName}
        reasons={content.whyBook}
      />
    </div>
  );
}

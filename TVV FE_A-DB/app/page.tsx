import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { AndamanSpotlight } from "@/components/sections/AndamanSpotlight";
import { DestinationTabs } from "@/components/sections/DestinationTabs";
import { TravelByExperience } from "@/components/sections/TravelByExperience";
import { FeaturedJourneys } from "@/components/sections/FeaturedJourneys";
import { EditorialGuides } from "@/components/sections/EditorialGuides";
import { ReelStorytelling } from "@/components/sections/ReelStorytelling";
import { TestimonialStrip } from "@/components/sections/TestimonialStrip";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import {
  destinationsService,
  experiencesService,
  guidesService,
  packagesService,
  reviewsService,
} from "@/lib/services";

export const revalidate = 300;

/**
 * Homepage — server component. Fetches every section's data in parallel via
 * services. Sections are pure renderers — they receive data as props.
 */
export default async function HomePage() {
  const [
    featuredPackages,
    destinations,
    experiences,
    guides,
    reels,
    reviews,
    trust,
    andamanItems,
  ] = await Promise.all([
    packagesService.featured(),
    destinationsService.homepageShelf(),
    experiencesService.list({ limit: 8 }),
    guidesService.list({ limit: 4 }),
    guidesService.reels(),
    reviewsService.list(3),
    reviewsService.trustStats(),
    guidesService.andamanSpotlight(),
  ]);

  return (
    <>
      <Hero />
      <TrustBar stats={trust.ok ? trust.data : []} />
      <AndamanSpotlight items={andamanItems.ok ? andamanItems.data : []} />
      <DestinationTabs destinations={destinations.ok ? destinations.data : []} />
      <TravelByExperience experiences={experiences.ok ? experiences.data : []} />
      <FeaturedJourneys packages={featuredPackages.ok ? featuredPackages.data : []} />
      <EditorialGuides guides={guides.ok ? guides.data : []} />
      <ReelStorytelling reels={reels.ok ? reels.data : []} />
      <TestimonialStrip reviews={reviews.ok ? reviews.data : []} />
      <ConciergeCTA />
    </>
  );
}

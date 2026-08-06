import { notFound } from "next/navigation";
import { prisma } from "@/shared/database/prisma-client";
import { DestinationHero } from "@/features/destination-landing/components/DestinationHero";
import { MarketingHero } from "@/features/destination-landing/components/MarketingHero";
import { PackageShowcase } from "@/features/destination-landing/components/PackageShowcase";
import { HotelShowcase } from "@/features/destination-landing/components/HotelShowcase";
import { ValueProposition } from "@/features/destination-landing/components/ValueProposition";
import { InclusionsExclusions } from "@/features/destination-landing/components/InclusionsExclusions";
import { ItineraryTimeline } from "@/features/destination-landing/components/ItineraryTimeline";
import { WhyBookSection } from "@/features/destination-landing/components/WhyBookSection";
import type { Metadata } from "next";
import Script from "next/script";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const customLandingPage = await prisma.landingPage.findUnique({
    where: { slug }
  }) as any;

  if (customLandingPage) {
    const seo = customLandingPage.seo as any || {};
    return {
      title: seo.title || customLandingPage.title || "The Vacation Voice",
      description: seo.description || "",
    };
  }

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

  // 1. Fetch Custom Landing Page
  const customLandingPage = await prisma.landingPage.findUnique({
    where: { slug }
  }) as any;

  if (customLandingPage && Array.isArray(customLandingPage.blocks)) {
    const fbPixelId = customLandingPage.seo?.tracking?.fbPixelId;
    const googleAdsId = customLandingPage.seo?.tracking?.googleAdsId;
    
    // Strict validation to prevent XSS
    const isValidFbPixel = fbPixelId && /^\d+$/.test(fbPixelId);
    const isValidGoogleAds = googleAdsId && /^AW-\d+$/.test(googleAdsId);

    // RENDER NEW JSON BLOCKS DYNAMICALLY
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900">
        {isValidFbPixel && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
        {isValidGoogleAds && (
          <Script id="google-ads" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`} />
        )}
        {isValidGoogleAds && (
          <Script id="google-ads-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAdsId}');
            `}
          </Script>
        )}
        {customLandingPage.blocks.map((block: any, idx: number) => {
          if (block.type === 'MARKETING_HERO') {
            return (
              <MarketingHero 
                key={block.id || idx}
                destination={{ name: customLandingPage.title, slug: customLandingPage.slug } as any}
                config={block.config}
              />
            );
          }
          if (block.type === 'HERO') {
            return (
              <DestinationHero 
                key={block.id || idx}
                destination={{ name: customLandingPage.title }} 
                heroImage={block.config?.backgroundImage || "/placeholder-destination.jpg"} 
                customHeadline={block.config?.headline}
                customSubheadline={block.config?.subheadline}
              />
            );
          }
          if (block.type === 'PACKAGES') {
            // Packages are fetched asynchronously below, but for a Server Component map, 
            // we should ideally fetch them beforehand. We'll render a placeholder or fetch synchronously 
            // if we restructure. Since this is a simple implementation, we can just pass packageIds if the component supported it,
            // or we skip it for the immediate rewrite and fetch them if needed.
            // Let's implement a quick wrapper for packages if block.type === PACKAGES.
            return <PackageBlockResolver key={block.id || idx} packageIds={block.config?.packageIds || []} title="Featured Packages" />;
          }
          if (block.type === 'FAQS') {
            // Render FAQs component (assuming we had one, else simple div)
            return (
              <div key={block.id || idx} className="py-12 px-6 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                {/* FAQ mapping would go here */}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }

  // 2. Fallback to standard Destination Rendering
  const destination = await prisma.destination.findUnique({
    where: { slug },
  }) as any;

  if (!destination) {
    notFound();
  }

  const packages = await prisma.package.findMany({
    where: { destinationId: destination.id, status: "PUBLISHED", isTemplate: false },
    take: 12,
  });
  const bestDeals = packages.slice(0, 6);
  const honeymoons = packages.slice(6, 12);

  const packageIds = [...bestDeals, ...honeymoons].map(p => p.id);
  const pricings = await prisma.packagePricing.findMany({
    where: { packageId: { in: packageIds } }
  });
  
  const attachPricing = (pkg: any) => {
    const pricing = pricings.find((p: any) => p.packageId === pkg.id);
    return { ...pkg, pricing };
  };

  const gallery = destination?.gallery as any;
  const heroImage = gallery?.images?.[0] || "/placeholder-destination.jpg";
  const displayDestName = destination?.name || slug;

  const tjHotels = await prisma.tjHotel.findMany({
    where: { city: { cityName: { contains: displayDestName, mode: "insensitive" } } },
    take: 8,
  });

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <DestinationHero 
        destination={{ name: displayDestName }} 
        heroImage={heroImage} 
      />
      
      {bestDeals.length > 0 && (
        <PackageShowcase 
          title={`Best ${displayDestName} Deals`} 
          subtitle="Curated with expertise" 
          packages={bestDeals.map(attachPricing) as any} 
        />
      )}

      {honeymoons.length > 0 && (
        <PackageShowcase 
          title="Romantic Escapes & Honeymoons" 
          subtitle="Make your special moments unforgettable with our curated couple packages." 
          packages={honeymoons.map(attachPricing) as any} 
        />
      )}

      {tjHotels.length > 0 && (
        <HotelShowcase 
          title={`Luxury Stays in ${displayDestName}`}
          subtitle="Top Rated Hotels"
          hotels={tjHotels}
        />
      )}
    </div>
  );
}

async function PackageBlockResolver({ packageIds, title }: { packageIds: string[], title: string }) {
  if (!packageIds || packageIds.length === 0) return null;
  const packages = await prisma.package.findMany({
    where: { id: { in: packageIds }, status: "PUBLISHED" }
  });
  if (packages.length === 0) return null;

  const pricings = await prisma.packagePricing.findMany({
    where: { packageId: { in: packages.map(p => p.id) } }
  });
  
  const pkgsWithPricing = packages.map(pkg => ({
    ...pkg,
    pricing: pricings.find((p: any) => p.packageId === pkg.id)
  }));

  return (
    <PackageShowcase 
      title={title} 
      subtitle="" 
      packages={pkgsWithPricing as any} 
    />
  );
}

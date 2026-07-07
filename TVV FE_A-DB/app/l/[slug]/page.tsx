import { notFound } from "next/navigation";
import { HeroSection, HeroBackground, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { PackageCard } from "@/components/cards/PackageCard";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/admin/landing-pages`);
  const data = await res.json();
  const page = data.data?.find((p: any) => p.slug === slug);
  
  if (!page) return buildMetadata({ title: "Not Found", description: "" });
  return buildMetadata({ title: page.title, description: page.heroSection?.description });
}

export default async function DynamicLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  
  // Note: Fetching from the admin API temporarily since this is the only API we built for it.
  const res = await fetch(`${baseUrl}/api/admin/landing-pages`, { next: { revalidate: 60 } });
  const data = await res.json();
  const page = data.data?.find((p: any) => p.slug === slug);

  if (!page) notFound();

  const hero = page.heroSection || {};
  const packages = page.packages || [];
  const faqs = page.faqSection || [];

  return (
    <>
      <HeroSection tall>
        <HeroBackground src={hero.backgroundImage || "/default-hero.jpg"} />
        <Container>
          <div className="max-w-3xl">
            <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-tight text-balance text-white drop-shadow-lg">
              {hero.headline || page.title}
            </h1>
            <p className="mt-8 max-w-xl text-[18px] leading-relaxed text-white/90 text-pretty drop-shadow-md">
              {hero.description}
            </p>
          </div>
        </Container>
      </HeroSection>

      <Section tone="cream" className="py-24 lg:py-32">
        <Container>
          <SectionHeader
            eyebrow="Curated Packages"
            title="Explore our exclusive offers"
            description="Hand-picked itineraries designed specifically for this destination."
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg: any, idx: number) => (
              <div key={idx} className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{pkg.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{pkg.description}</p>
                <div className="mt-4 font-medium text-primary">{pkg.price}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

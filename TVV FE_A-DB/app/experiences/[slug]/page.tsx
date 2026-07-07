import Image from "next/image";
import { notFound } from "next/navigation";
import { HeroSection, HeroBackground, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { PackageCard } from "@/components/cards/PackageCard";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { CardRail, CardRailItem } from "@/components/sections/CardRail";
import { StickyCTA } from "@/components/ui/StickyCTA";
import { FadeUp, FadeUpItem } from "@/components/ui/FadeUp";
import { experiencesService, packagesService } from "@/lib/services";
import { experienceStaticSlugs } from "@/lib/ssg/static-paths";
import { buildMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const slugs = await experienceStaticSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await experiencesService.getBySlug(slug);
  if (!res.ok || !res.data) return buildMetadata({ title: "Experience not found", description: "", path: `/experiences/${slug}` });
  const exp = res.data;
  return buildMetadata({
    title: `${exp.title} Journeys — Curated by TVV`,
    description: exp.description,
    path: `/experiences/${exp.slug}`,
    image: exp.image,
  });
}

export const revalidate = 600;

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const expRes = await experiencesService.getBySlug(slug);
  if (!expRes.ok || !expRes.data) notFound();
  const exp = expRes.data;

  const themeKey = exp.slug === "scuba-diving" ? "snorkelling" : exp.slug;
  const [themeRes, allRes] = await Promise.all([
    packagesService.byTheme(themeKey),
    packagesService.list({ limit: 6 }),
  ]);
  const tours = themeRes.ok && themeRes.data.length > 0
    ? themeRes.data
    : (allRes.ok ? allRes.data : []);

  return (
    <>
      <StickyCTA label={`Plan a ${exp.title} Journey`} href={`/contact?experience=${exp.slug}`} />
      
      <HeroSection tall>
        <HeroBackground src={exp.image} />
        <Container>
          <HeroBreadcrumb
            absolute
            items={[
              { label: "Home", href: "/" },
              { label: "Experiences", href: "/experiences" },
              { label: exp.title },
            ]}
          />
          <FadeUp stagger delay={0.2} className="max-w-3xl">
            <FadeUpItem>
              <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-gold drop-shadow-md">Curated Experience</p>
            </FadeUpItem>
            <FadeUpItem>
              <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-tight text-balance drop-shadow-lg">
                {exp.title}.
              </h1>
            </FadeUpItem>
            <FadeUpItem>
              <p className="mt-8 max-w-xl text-[18px] leading-relaxed text-white/90 text-pretty drop-shadow-md">
                {exp.description}
              </p>
            </FadeUpItem>
          </FadeUp>
        </Container>
      </HeroSection>

      <Section tone="cream" className="py-24 lg:py-32">
        <Container>
          <SectionHeader
            eyebrow={`${exp.title} journeys`}
            title="Curated for the way you travel."
            description="A working shelf of routes that match this thread. Tell us your dates — we'll redraw any one of them around you."
          />
          <div className="mt-16">
            <CardRail>
              {tours.map((t) => (
                <CardRailItem key={t.slug}>
                  <PackageCard data={t} />
                </CardRailItem>
              ))}
            </CardRail>
          </div>
        </Container>
      </Section>

      <ConciergeCTA />
    </>
  );
}

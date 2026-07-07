import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HeroSection, HeroBackground, HeroBreadcrumb } from "@/components/ui/HeroLayout";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { GuideCard } from "@/components/cards/GuideCard";
import { ConciergeCTA } from "@/components/sections/ConciergeCTA";
import { JsonLd } from "@/components/ui/JsonLd";
import { StickyCTA } from "@/components/ui/StickyCTA";
import { FadeUp, FadeUpItem } from "@/components/ui/FadeUp";
import { guidesService } from "@/lib/services";
import { guideStaticSlugs } from "@/lib/ssg/static-paths";
import { buildMetadata, SITE } from "@/lib/seo";

export async function generateStaticParams() {
  const slugs = await guideStaticSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await guidesService.getBySlug(slug);
  if (!res.ok || !res.data) return buildMetadata({ title: "Guide not found", description: "", path: `/guides/${slug}` });
  const g = res.data;
  return buildMetadata({
    title: g.title,
    description: g.excerpt,
    path: `/guides/${g.slug}`,
    image: g.image,
    keywords: [g.category, "TVV travel guide"],
  });
}

export const revalidate = 1800;

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guideRes = await guidesService.getBySlug(slug);
  if (!guideRes.ok || !guideRes.data) notFound();
  const guide = guideRes.data;

  const allRes = await guidesService.list();
  const all = allRes.ok ? allRes.data : [];
  const related = all.filter((g) => g.slug !== guide.slug && g.category === guide.category).slice(0, 3);
  const fallback = all.filter((g) => g.slug !== guide.slug).slice(0, 3);
  const moreReads = related.length > 0 ? related : fallback;

  return (
    <>
      <StickyCTA label={`Plan a ${guide.category} Journey`} href={`/contact?destination=${guide.category.toLowerCase()}`} />
      
      <HeroSection tall>
        <HeroBackground src={guide.image} />
        <Container>
          <HeroBreadcrumb
            absolute
            items={[
              { label: "Home", href: "/" },
              { label: "Guides", href: "/guides" },
              { label: guide.title },
            ]}
          />
          <FadeUp stagger delay={0.2} className="max-w-3xl">
            <FadeUpItem>
              <div className="flex items-center gap-4 text-[12px] uppercase tracking-widest text-gold drop-shadow-md">
                <span className="font-bold">{guide.category}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>{guide.readTime} min read</span>
              </div>
            </FadeUpItem>
            <FadeUpItem>
              <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-tight tracking-tight text-balance drop-shadow-lg">
                {guide.title}
              </h1>
            </FadeUpItem>
            <FadeUpItem>
              <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-white/90 drop-shadow-md">
                {guide.excerpt}
              </p>
            </FadeUpItem>
            <FadeUpItem>
              <div className="mt-10 flex items-center gap-4 border-t border-white/20 pt-6 text-[13px] font-medium tracking-wide text-white/60 uppercase">
                <span>Words by {guide.author}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>{new Date(guide.publishedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
              </div>
            </FadeUpItem>
          </FadeUp>
        </Container>
      </HeroSection>

      <Section tone="cream" className="py-24 lg:py-32">
        <Container size="narrow">
          <div className="prose-tvv space-y-8 text-[18px] leading-[1.9] text-ink-secondary">
            <p className="text-[22px] leading-[1.7] text-ink first-letter:float-left first-letter:mr-4 first-letter:font-display first-letter:text-[72px] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-teal">
              The first time I went to {guide.category.toLowerCase()}, I went the way most travellers go — with a
              top-ten list, a packed itinerary, and no real plan for the afternoon. This guide is the one I wish
              I'd had then.
            </p>
            <p>
              What follows is built from twelve trips, four monsoon seasons, and a small collection of arguments
              with hotel concierges. It is not exhaustive. It is the version of {guide.category} I'd give a
              friend, written the way I'd tell it to them over a long dinner.
            </p>

            <h2 className="mt-16 font-display text-[32px] leading-tight text-ink">First, when to go</h2>
            <p>
              Most guides will tell you the high season runs October through February, and they're right — sort of.
              The shoulder months are where the trip changes. By March, the light has softened. By May, the
              resorts are quieter and the prices reflect it. By the second week of October, the post-monsoon
              plankton bloom turns the water a colour you won't forget.
            </p>
            <p>
              The wrong question is "what's the best month." The right question is "what kind of trip do I want."
              Our specialists choose the week, not the month, and the difference shows.
            </p>

            <div className="my-16 overflow-hidden rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative aspect-[4/3] w-full">
              <Image src={guide.image} alt="" fill className="object-cover" sizes="(min-width: 1024px) 800px, 100vw" />
            </div>

            <h2 className="mt-16 font-display text-[32px] leading-tight text-ink">Where to stay</h2>
            <p>
              Three properties matter more than the rest. The first is a boutique stay run by a family who
              still personally greet every guest. The second is a former government rest-house, converted with
              restraint and run by a small team. The third — and this is where we send most honeymooners — is a
              villa property that doesn't market itself online.
            </p>
            <p>You won't find these by searching. Ask your specialist.</p>

            <h2 className="mt-16 font-display text-[32px] leading-tight text-ink">A specialist's afternoon</h2>
            <p>
              Skip the obvious. Take a private boat at three p.m., go to the eastern side of the island, and
              swim where the locals swim. Eat where there is no menu. Watch the light fold over the water
              around six-fifteen. This is the part of the trip you'll talk about when you get home — not the
              checklist beach with the same photograph everyone takes.
            </p>

            <h2 className="mt-16 font-display text-[32px] leading-tight text-ink">In closing</h2>
            <p>
              The point of a destination is not to see it. The point is to notice it. The best trips we plan
              are the ones with room to do less — and the right specialist to make sure the less is the right less.
            </p>
            <p className="font-display text-[24px] italic text-teal">Plan slowly. Travel well.</p>
          </div>

          <div className="mt-20 rounded-[24px] border border-line bg-white p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-teal">Ready to plan a journey like this?</p>
            <p className="mt-4 font-display text-[24px] leading-snug text-ink">
              The specialist who wrote this guide — and three others — designs trips like the one described above. Write to us.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-full bg-teal px-8 text-[13px] font-bold uppercase tracking-wider text-white transition-all hover:bg-teal-hover hover:shadow-[0_8px_20px_rgba(14,99,92,0.3)] hover:-translate-y-0.5">
                Plan my journey
              </Link>
              <Link href="/guides" className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-white px-8 text-[13px] font-bold uppercase tracking-wider text-ink transition-all hover:border-ink hover:bg-surface">
                More guides
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="white" pad="default">
        <Container>
          <SectionHeader eyebrow="Keep reading" title="More from the editorial desk." viewAllHref="/guides" viewAllLabel="All guides" />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {moreReads.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </Container>
      </Section>

      <ConciergeCTA />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.excerpt,
          image: guide.image,
          datePublished: guide.publishedAt,
          author: { "@type": "Person", name: guide.author },
          publisher: {
            "@type": "Organization",
            name: SITE.name,
            logo: { "@type": "ImageObject", url: `${SITE.url}/logo.svg` },
          },
          mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE.url}/guides/${guide.slug}` },
        }}
      />
    </>
  );
}

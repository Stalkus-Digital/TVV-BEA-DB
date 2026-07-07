import Image from "next/image";
import { DestinationBreadcrumb } from "./DestinationBreadcrumb";
import type { BreadcrumbItem } from "../types";

interface HeroNode {
  name: string;
  heroImageUrl?: string | null;
  imageUrl?: string | null;
  metaDescription?: string | null;
}

interface DestinationHeroProps {
  node: HeroNode;
  crumbs: BreadcrumbItem[];
  kindLabel: string;
}

export function DestinationHero({ node, crumbs, kindLabel }: DestinationHeroProps) {
  const heroImage = node.heroImageUrl ?? node.imageUrl ?? null;

  return (
    <section className="relative isolate overflow-hidden bg-navy text-white pt-32 pb-20 lg:pt-40 lg:pb-28">
      {heroImage && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroImage}
            alt={node.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/40 to-navy" />
        </div>
      )}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <DestinationBreadcrumb items={crumbs} />
        <p className="text-[12px] uppercase tracking-[0.2em] text-gold">{kindLabel}</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight text-balance">
          {node.name}
        </h1>
        {node.metaDescription && (
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/85">{node.metaDescription}</p>
        )}
      </div>
    </section>
  );
}

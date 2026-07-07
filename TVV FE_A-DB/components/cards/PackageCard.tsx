"use client";

/**
 * Unified PackageCard — Luxury Redesign
 *
 * Implements a premium cinematic aesthetic:
 *   • Full-bleed image with softer 4/5 or 3/4 aspect ratios.
 *   • Floating glassmorphic info panel.
 *   • Soft Apple-like shadows and hover lifts.
 *   • Squircle border radii.
 */

import Image from "next/image";
import Link from "next/link";
import { Plane, Clock } from "lucide-react";
import type { CardBadge, Package } from "@/lib/models";
import { PackageWishlistToggle } from "@/features/dashboard";
import { resolveImageSrc } from "@/lib/adapters/publicApi";
import { cn, formatINR } from "@/lib/utils";
import { Stars } from "@/components/ui/Stars";

const badgeStyle: Record<CardBadge, string> = {
  "flights-included": "bg-white/20 text-white backdrop-blur-md border border-white/20",
  "flash-sale": "bg-warn/90 text-white backdrop-blur-md",
  "limited-seats": "bg-danger/90 text-white backdrop-blur-md",
  "staff-pick": "bg-gold/90 text-white backdrop-blur-md",
  exclusive: "bg-navy/80 text-white backdrop-blur-md",
  new: "bg-teal/90 text-white backdrop-blur-md",
  verified: "bg-success/90 text-white backdrop-blur-md",
};

const badgeLabel: Record<CardBadge, string> = {
  "flights-included": "Flights included",
  "flash-sale": "Flash sale",
  "limited-seats": "Limited seats",
  "staff-pick": "Staff picked",
  exclusive: "Exclusive",
  new: "New",
  verified: "Verified",
};

interface PackageCardProps {
  data: Package;
  className?: string;
  priority?: boolean;
  href?: string;
  showVendorChip?: boolean;
}

export function PackageCard({
  data,
  className,
  priority,
  href,
  showVendorChip = false,
}: PackageCardProps) {
  const detailHref = href ?? `/packages/${data.slug}`;
  const isExclusive = data.badges?.includes("exclusive");
  const hasFlights = data.badges?.includes("flights-included");
  const primaryBadge = data.badges?.find((b) => b !== "flights-included");
  const saved =
    data.pricing.originalPerAdult && data.pricing.perAdult
      ? data.pricing.originalPerAdult - data.pricing.perAdult
      : 0;
  const heroSrc = resolveImageSrc(data.hero.image);

  return (
    <article
      data-vendor={data.vendor.source}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[24px] bg-navy/5 transition-all duration-500",
        "shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]",
        isExclusive && "ring-1 ring-gold/40",
        className,
      )}
    >
      <Link href={detailHref} className="relative block aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden">
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt={data.hero.alt ?? data.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
            priority={priority}
            className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy/10 to-teal/10">
            <span className="font-display text-sm text-ink-muted">{data.destination}</span>
          </div>
        )}
        
        {/* Soft, premium gradient overlay for top contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/60 via-transparent to-navy/30 mix-blend-multiply" />
        {/* Secondary overlay for text legibility without muddying colors */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-col items-start gap-2 z-10">
          {hasFlights && (
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]", badgeStyle["flights-included"])}>
              <Plane className="h-3 w-3" aria-hidden /> {badgeLabel["flights-included"]}
            </span>
          )}
          {primaryBadge && (
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]", badgeStyle[primaryBadge])}>
              {badgeLabel[primaryBadge]}
            </span>
          )}
        </div>

        {showVendorChip && (
          <span className="absolute right-14 top-4 z-10 inline-flex items-center rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white backdrop-blur-md">
            {data.vendor.vendorName && data.vendor.vendorName !== "travel-os"
              ? data.vendor.vendorName
              : "TVV"}
          </span>
        )}

        <PackageWishlistToggle packageSlug={data.slug} />

        {/* Floating Glass Info Panel */}
        <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 z-20 flex flex-col gap-2 rounded-[16px] border border-white/40 bg-white/80 p-4 backdrop-blur-xl transition-all duration-500 group-hover:bg-white/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
              <Clock className="h-3.5 w-3.5 text-teal" aria-hidden />
              <span>{data.durationDays}D / {data.durationNights}N</span>
            </div>
            {typeof data.rating === "number" && (
              <div className="inline-flex items-center gap-1">
                <Stars value={data.rating} count={data.ratingCount} size="sm" />
              </div>
            )}
          </div>

          <div className="mt-1">
            <h3 className="line-clamp-2 font-display text-[1.25rem] leading-[1.2] tracking-tight text-ink transition-colors group-hover:text-teal">
              {data.title}
            </h3>
            {data.subtitle && (
              <p className="mt-1 line-clamp-1 text-[12px] text-ink-muted">{data.subtitle}</p>
            )}
          </div>

          <div className="mt-3 flex items-end justify-between border-t border-ink/10 pt-3">
            <div>
              {data.pricing.originalPerAdult && (
                <p className="font-mono text-[11px] text-danger/80 line-through">
                  {formatINR(data.pricing.originalPerAdult)}
                </p>
              )}
              {data.pricing.perAdult > 0 ? (
                <p className="font-mono text-[1.125rem] font-bold leading-none text-ink">
                  {formatINR(data.pricing.perAdult)}
                  <span className="ml-1 text-[10px] font-normal uppercase tracking-wider text-ink-muted">/Person</span>
                </p>
              ) : (
                <p className="font-display text-[14px] font-medium text-teal">Price on request</p>
              )}
            </div>

            <div className="inline-flex h-8 items-center justify-center rounded-full bg-navy px-4 text-[12px] font-medium text-white transition-colors duration-300 hover:bg-teal">
              View
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

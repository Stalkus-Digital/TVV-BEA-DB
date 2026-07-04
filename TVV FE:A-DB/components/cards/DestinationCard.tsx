import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/lib/types";
import { resolveImageSrc } from "@/lib/adapters/publicApi";
import { cn, formatPriceShort } from "@/lib/utils";

interface Props {
  destination: Destination;
  variant?: "compact" | "tall" | "wide";
  className?: string;
  priority?: boolean;
}

export function DestinationCard({ destination, variant = "tall", className, priority }: Props) {
  const href = destination.slug === "andaman" ? "/andaman" : `/destinations/${destination.slug}`;
  const ratio =
    variant === "compact" ? "aspect-[4/5]" : variant === "wide" ? "aspect-[5/4]" : "aspect-[3/4]";
  const imageSrc = resolveImageSrc(destination.image);

  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-[24px] bg-navy transition-all duration-500",
        "shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]",
        ratio,
        className,
      )}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={destination.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 70vw"
          priority={priority}
          className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.05]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-navy/30 to-teal/20" aria-hidden />
      )}
      
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 pointer-events-none" />
      
      {/* Dark Glass Info Panel */}
      <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 flex flex-col rounded-[16px] border border-white/20 bg-black/40 p-4 backdrop-blur-xl transition-all duration-500 group-hover:bg-black/50">
        <p className="text-[10px] uppercase tracking-[0.14em] text-white/80">{destination.continent ?? "Destination"}</p>
        <h3 className="mt-1 font-display text-[1.5rem] leading-[1.15] text-white transition-colors group-hover:text-gold">
          {destination.name}
        </h3>
        <p className="mt-1 line-clamp-1 text-[12px] text-white/70">{destination.tagline}</p>
        
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/90">
            From <span className="text-[14px] text-gold">{formatPriceShort(destination.startsFrom)}</span>
          </p>
          <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-gold group-hover:text-navy">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

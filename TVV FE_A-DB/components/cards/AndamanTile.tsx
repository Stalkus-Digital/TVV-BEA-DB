import Image from "next/image";
import Link from "next/link";
import type { AndamanTileItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  item: AndamanTileItem;
  variant?: "default" | "feature";
  className?: string;
}

export function AndamanTile({ item, variant = "default", className }: Props) {
  const isFeature = variant === "feature";
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative block overflow-hidden rounded-[24px] bg-navy transition-all duration-500",
        "shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]",
        isFeature ? "aspect-[5/6] sm:aspect-[4/5]" : "aspect-[4/5]",
        className,
      )}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(min-width: 1024px) 33vw, 80vw"
        className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.05]"
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 pointer-events-none" />

      {item.meta && (
        <span className="absolute right-4 top-4 z-10 inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white backdrop-blur-md border border-white/20">
          {item.meta}
        </span>
      )}

      {/* Dark Glass Info Panel */}
      <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 z-20 flex flex-col rounded-[16px] border border-white/20 bg-black/40 p-4 sm:p-5 backdrop-blur-xl transition-all duration-500 group-hover:bg-black/50">
        <p className="mb-1.5 text-[10px] uppercase tracking-[0.16em] text-gold/90">Andaman · TVV signature</p>
        <h3 className={cn("font-display text-white transition-colors group-hover:text-gold", isFeature ? "text-[1.75rem] leading-tight" : "text-[1.5rem] leading-tight")}>
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/80">
          {item.description}
        </p>
        
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/90">
            Explore
          </span>
          <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-gold group-hover:text-navy">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

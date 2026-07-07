import Image from "next/image";
import Link from "next/link";
import { Compass, Heart, Gem, Leaf, Users, Waves, Utensils, Landmark } from "lucide-react";
import type { Experience } from "@/lib/types";
import { resolveImageSrc } from "@/lib/adapters/publicApi";
import { cn } from "@/lib/utils";

const iconMap = {
  compass: Compass,
  heart: Heart,
  gem: Gem,
  leaf: Leaf,
  users: Users,
  waves: Waves,
  utensils: Utensils,
  landmark: Landmark,
} as const;

interface Props {
  experience: Experience;
  className?: string;
}

export function ExperienceCard({ experience, className }: Props) {
  const Icon = (iconMap as Record<string, typeof Compass>)[experience.icon] ?? Compass;
  const imageSrc = resolveImageSrc(experience.image);

  return (
    <Link
      href={`/experiences/${experience.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[24px] bg-navy/5 transition-all duration-500",
        "shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <div className="relative block aspect-[4/5] sm:aspect-[1/1] w-full overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={experience.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy/20 to-teal/15" aria-hidden />
        )}
        
        {/* Dark overlay for top contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
        
        {/* Floating icon */}
        <span className="absolute left-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-card">
          <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </span>
        
        {/* Floating Glass Info Panel */}
        <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 z-20 flex flex-col gap-2 rounded-[16px] border border-white/40 bg-white/80 p-4 backdrop-blur-xl transition-all duration-500 group-hover:bg-white/95">
          <h3 className="font-display text-[1.25rem] leading-tight text-ink transition-colors group-hover:text-teal">{experience.title}</h3>
          <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-secondary">{experience.description}</p>
          <div className="mt-2 flex items-center justify-between border-t border-ink/10 pt-3">
            {typeof experience.count === "number" && (
              <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">{experience.count} journeys</span>
            )}
            <span className="inline-flex h-8 items-center justify-center rounded-full bg-navy px-4 text-[12px] font-medium text-white transition-colors duration-300 hover:bg-teal">
              Explore
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

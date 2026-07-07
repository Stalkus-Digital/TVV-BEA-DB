import Image from "next/image";
import { Play } from "lucide-react";
import type { Reel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  reel: Reel;
  className?: string;
}

export function ReelCard({ reel, className }: Props) {
  return (
    <button
      type="button"
      aria-label={`Play reel: ${reel.title}`}
      className={cn(
        "group relative block aspect-[9/14] w-full overflow-hidden rounded-lg bg-navy text-left",
        className,
      )}
    >
      <Image
        src={reel.poster}
        alt={reel.title}
        fill
        sizes="(min-width: 1024px) 16vw, 50vw"
        className="object-cover transition-transform duration-[700ms] ease-premium group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/10" />

      <span className="absolute right-3 top-3 inline-flex items-center rounded-sm bg-white/15 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
        {reel.durationLabel}
      </span>

      <span className="absolute left-1/2 top-1/2 inline-flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy shadow-modal transition-transform duration-base group-hover:scale-[1.06]">
        <Play className="h-5 w-5 translate-x-0.5 fill-navy" aria-hidden />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-gold">{reel.destination}</p>
        <p className="mt-1 font-display text-[16px] leading-tight text-white">{reel.title}</p>
      </div>
    </button>
  );
}

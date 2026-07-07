import Image from "next/image";
import Link from "next/link";
import type { Guide } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  guide: Guide;
  variant?: "default" | "feature";
  className?: string;
}

export function GuideCard({ guide, variant = "default", className }: Props) {
  const isFeature = variant === "feature";
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[24px] bg-white transition-all duration-500",
        "shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <div className={cn("relative w-full overflow-hidden", isFeature ? "aspect-[16/9]" : "aspect-[5/3]")}>
        <Image
          src={guide.image}
          alt={guide.title}
          fill
          sizes="(min-width: 1024px) 33vw, 90vw"
          className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.05]"
        />
      </div>
      <div className={cn("flex flex-1 flex-col gap-2 bg-white", isFeature ? "p-6" : "p-5")}>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-teal">
          <span>{guide.category}</span>
          <span className="text-ink-muted">·</span>
          <span className="text-ink-muted">{guide.readTime}</span>
        </div>
        <h3
          className={cn(
            "font-display leading-[1.25] text-ink transition-colors group-hover:text-teal",
            isFeature ? "text-[1.75rem]" : "text-[1.25rem]",
          )}
        >
          {guide.title}
        </h3>
        <p className={cn("text-[13px] leading-relaxed text-ink-secondary", isFeature ? "line-clamp-3" : "line-clamp-2")}>
          {guide.excerpt}
        </p>
        <div className="mt-auto pt-4 border-t border-ink/5">
          <p className="text-[11px] text-ink-muted">
            {guide.author} ·{" "}
            {new Date(guide.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}

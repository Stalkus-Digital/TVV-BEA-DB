import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumb({
  items,
  className,
  invert = false,
}: {
  items: { label: string; href?: string }[];
  className?: string;
  invert?: boolean;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "text-caption flex items-center gap-1.5 flex-wrap",
        invert ? "text-white/60" : "text-ink-muted",
        className,
      )}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="inline-flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={cn(
                  "hover:underline underline-offset-2",
                  invert ? "hover:text-white" : "hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast && (invert ? "text-white" : "text-ink"))}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />}
          </span>
        );
      })}
    </nav>
  );
}

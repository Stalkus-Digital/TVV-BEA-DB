import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  invert = true,
  withWordmark = true,
  className,
}: {
  invert?: boolean;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" aria-label="The Vacation Voice — home" className={cn("inline-flex items-center gap-3", className)}>
      <span
        aria-hidden
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md font-display text-[15px] font-bold tracking-tight",
          invert ? "bg-teal text-white" : "bg-navy text-white",
        )}
      >
        VV
      </span>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[15px] font-semibold tracking-tight",
              invert ? "text-white" : "text-ink",
            )}
          >
            The Vacation Voice
          </span>
          <span
            className={cn(
              "mt-0.5 text-[10px] uppercase tracking-[0.18em]",
              invert ? "text-white/50" : "text-ink-muted",
            )}
          >
            Global · Andaman
          </span>
        </span>
      )}
    </Link>
  );
}

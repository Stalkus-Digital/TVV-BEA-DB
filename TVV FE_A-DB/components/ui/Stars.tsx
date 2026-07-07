import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  count,
  size = "sm",
  invert = false,
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  invert?: boolean;
  className?: string;
}) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star className={cn(dim, "fill-gold text-gold")} strokeWidth={0} aria-hidden />
      <span className={cn("font-semibold", invert ? "text-white" : "text-ink", size === "sm" ? "text-[12px]" : "text-[13px]")}>
        {value.toFixed(1)}
      </span>
      {typeof count === "number" && (
        <span className={cn(invert ? "text-white/60" : "text-ink-muted", size === "sm" ? "text-[11px]" : "text-[12px]")}>
          ({count.toLocaleString("en-IN")})
        </span>
      )}
    </span>
  );
}

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Container({
  className,
  size = "wide",
  ...props
}: HTMLAttributes<HTMLDivElement> & { size?: "narrow" | "default" | "wide" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 lg:px-8",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-6xl",
        size === "wide" && "max-w-[1400px]",
        className,
      )}
      {...props}
    />
  );
}

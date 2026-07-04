import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "teal"
  | "gold"
  | "navy"
  | "warn"
  | "danger"
  | "success"
  | "info"
  | "ghost";

const tones: Record<Tone, string> = {
  teal: "bg-teal-light text-teal",
  gold: "bg-gold-light text-[#8a6b1f] border border-gold/30",
  navy: "bg-navy text-white",
  warn: "bg-warn-bg text-warn",
  danger: "bg-danger-bg text-danger",
  success: "bg-success-bg text-success",
  info: "bg-info-bg text-info",
  ghost: "bg-white/10 text-white border border-white/20",
};

export function Badge({
  tone = "teal",
  children,
  className,
  uppercase = true,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  uppercase?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-semibold tracking-[0.06em]",
        uppercase && "uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

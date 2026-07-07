import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "outline" | "outline-light" | "gold" | "link";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-teal text-white hover:bg-teal-hover border border-transparent shadow-sm",
  ghost: "bg-transparent text-teal hover:bg-teal-light border border-transparent",
  outline: "bg-transparent text-ink border border-line hover:border-line-strong hover:bg-surface",
  "outline-light":
    "bg-transparent text-white border border-white/40 hover:border-white hover:bg-white/10",
  gold: "bg-gold text-white hover:bg-gold/90 border border-transparent shadow-sm",
  link: "bg-transparent text-teal underline-offset-4 hover:underline border-0 p-0 h-auto rounded-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-5 text-[11px]",
  md: "h-12 px-6 text-[12px]",
  lg: "h-14 px-8 text-[13px]",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-[0.1em] transition-all duration-300 ease-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:pointer-events-none disabled:opacity-50";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        variant !== "link" && sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        baseClasses,
        variant !== "link" && sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}

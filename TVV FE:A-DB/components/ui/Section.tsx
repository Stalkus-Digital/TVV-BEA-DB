"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: "cream" | "white" | "surface" | "navy" | "gold-light";
  pad?: "default" | "tight" | "loose";
}

export function Section({ className, tone = "cream", pad = "default", ...props }: SectionProps) {
  return (
    <section
      className={cn(
        "relative",
        tone === "cream" && "bg-cream",
        tone === "white" && "bg-white",
        tone === "surface" && "bg-surface",
        tone === "navy" && "bg-navy text-white",
        tone === "gold-light" && "bg-gold-light",
        pad === "default" && "py-16 sm:py-20 lg:py-24",
        pad === "tight" && "py-10 sm:py-14",
        pad === "loose" && "py-20 sm:py-28 lg:py-section",
        className,
      )}
      {...props}
    />
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
  invert?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  viewAllHref,
  viewAllLabel = "View all",
  className,
  invert = false,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        "mb-10 flex flex-col gap-3",
        align === "center" && "items-center text-center",
        viewAllHref && align === "left" && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p
            className={cn(
              "mb-3 text-label uppercase",
              invert ? "text-gold" : "text-teal",
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "font-display text-[28px] sm:text-[34px] lg:text-[40px] leading-tight tracking-tight text-balance",
            invert ? "text-white" : "text-ink",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 text-body-lg text-pretty",
              invert ? "text-white/70" : "text-ink-secondary",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className={cn(
            "group inline-flex items-center gap-2 text-h4 font-semibold transition-colors",
            invert ? "text-gold hover:text-gold/80" : "text-teal hover:text-teal-hover",
          )}
        >
          {viewAllLabel}
          <span className="transition-transform duration-base group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </Link>
      )}
    </motion.div>
  );
}

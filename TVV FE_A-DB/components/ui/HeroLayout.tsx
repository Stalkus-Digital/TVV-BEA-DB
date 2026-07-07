import Image from "next/image";
import { ReactNode } from "react";
import { Container } from "./Container";
import { Breadcrumb } from "./Breadcrumb";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  children: ReactNode;
  className?: string;
  tall?: boolean;
}

export function HeroSection({ children, className, tall = false }: HeroSectionProps) {
  return (
    <section className={cn(
      "relative isolate overflow-hidden bg-navy text-white [&_h1]:text-white [&_h2]:text-white/90 [&_h3]:text-white/90",
      tall ? "flex min-h-[70vh] lg:min-h-[85vh] flex-col justify-end pb-16 pt-32 lg:pb-32" : "pt-28 pb-20 sm:pt-32 sm:pb-28 lg:pb-36",
      className
    )}>
      {children}
    </section>
  );
}

interface HeroBackgroundProps {
  src: string;
  alt?: string;
  priority?: boolean;
  opacity?: number;
}

export function HeroBackground({ src, alt = "", priority = true, opacity = 100 }: HeroBackgroundProps) {
  return (
    <div className="absolute inset-0 -z-10">
      <Image 
        src={src} 
        alt={alt} 
        fill 
        priority={priority} 
        sizes="100vw" 
        className={cn("object-cover", opacity !== 100 && `opacity-${opacity}`)} 
      />
      {/* 
        Intelligent Triple-Layer Gradient Overlay
        1. Top-down: Ensures navbar/breadcrumbs are perfectly readable.
        2. Middle: Provides a consistent dark tint to make text pop.
        3. Bottom-up: Blends the image seamlessly into the page content below.
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/50 to-navy/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
      <div className="grain absolute inset-0 opacity-35" aria-hidden />
    </div>
  );
}

interface HeroBreadcrumbProps {
  items: { label: string; href?: string }[];
  absolute?: boolean;
}

export function HeroBreadcrumb({ items, absolute = false }: HeroBreadcrumbProps) {
  if (absolute) {
    return (
      <div className="absolute top-28 lg:top-36 left-6 lg:left-10 z-10 max-w-full overflow-hidden pr-6">
         <Breadcrumb items={items} invert />
      </div>
    );
  }
  return (
    <div className="mb-8 sm:mb-12 max-w-full overflow-hidden">
      <Breadcrumb items={items} invert />
    </div>
  );
}

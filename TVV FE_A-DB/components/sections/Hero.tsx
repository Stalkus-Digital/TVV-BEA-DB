"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Award, ShieldCheck, ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";

const DESTINATIONS = [
  {
    title: "The Andamans",
    subtitle: "Untouched archipelagos and cinematic shores",
    image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=2400&q=85"
  },
  {
    title: "Kyoto, Japan",
    subtitle: "Where ancient tradition meets timeless elegance",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2400&q=85"
  },
  {
    title: "Amalfi Coast",
    subtitle: "Vertical landscapes and Mediterranean allure",
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=2400&q=85"
  }
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DESTINATIONS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = DESTINATIONS[currentIndex];

  return (
    <section className="relative isolate flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-navy text-white">
      {/* Cinematic Background Crossfade */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 -z-20"
        >
          <Image
            src={current.image}
            alt={current.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Layered Gradient Overlays for Depth and Readability */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/90 via-navy/50 to-navy/95" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
      <div className="grain absolute inset-0 -z-10 opacity-35" aria-hidden />

      <div className="relative z-10 flex w-full max-w-[1400px] flex-col items-center px-5 pt-32 pb-24 text-center sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
          className="flex flex-col items-center max-w-4xl"
        >
          <div className="flex min-h-[140px] flex-col items-center justify-center sm:min-h-[160px]">
            <h1 className="font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.05] tracking-tight text-white text-balance drop-shadow-lg">
              Discover
            </h1>
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentIndex}
                initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
                className="font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.05] tracking-tight text-gold italic text-balance drop-shadow-lg"
              >
                {current.title}
              </motion.h1>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
             <motion.p
               key={currentIndex}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.8, delay: 0.1 }}
               className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/80 text-pretty font-light sm:text-[19px]"
             >
               {current.subtitle}. We design quietly, we plan precisely, and we remain reachable through every mile of your journey.
             </motion.p>
          </AnimatePresence>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/contact" size="lg" className="rounded-full px-8 py-6 text-[15px] shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Plan Your Journey <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </ButtonLink>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-16 w-full max-w-3xl"
        >
          {/* Glassmorphic Dock for Search */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-md transition-all hover:bg-white/10">
            <SearchBar placeholder="Search Andaman, Kerala, Japan, Maldives…" ctaLabel="Search" />
          </div>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] font-medium tracking-wider text-white/70 uppercase">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden /> 65+ Destinations
            </span>
            <span className="inline-flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-gold" aria-hidden /> 12,400+ Journeys
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" aria-hidden /> 24/7 Concierge
            </span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Scroll to explore</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </motion.div>
      </motion.div>
    </section>
  );
}

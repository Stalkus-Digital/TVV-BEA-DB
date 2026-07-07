"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";

interface Props {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  image?: string;
}

export function ConciergeCTA({
  eyebrow = "Concierge",
  title = "Can't find quite the journey you're imagining?",
  description = "Our specialists design private itineraries from scratch — dates, pace, party size, and whatever else makes the trip yours. Most proposals are sent within four working hours.",
  primaryLabel = "Talk to a Specialist",
  primaryHref = "/contact",
  secondaryLabel = "Request a private consultation",
  secondaryHref = "/contact?type=consultation",
  image = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1800&q=85",
}: Props) {
  return (
    <section className="relative isolate flex min-h-[700px] items-center overflow-hidden bg-navy text-white">
      <div className="absolute inset-0 -z-10">
        <Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/30 backdrop-blur-sm" />
      </div>
      <div className="grain absolute inset-0 -z-10" aria-hidden />
      
      <Container className="relative z-10 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <p className="mb-6 text-[13px] font-bold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] tracking-tight text-balance text-white">
            {title}
          </h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/80 text-pretty">
            {description}
          </p>
          
          <div className="mt-10 flex w-full flex-col items-center justify-center gap-5 sm:flex-row sm:gap-6">
            <Link 
              href={primaryHref}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-white text-navy px-8 py-3.5 text-[13px] font-bold tracking-[0.1em] uppercase transition-all duration-500 hover:bg-gold hover:text-white shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(197,160,89,0.4)] hover:-translate-y-0.5"
            >
              {primaryLabel}
            </Link>
            <Link 
              href={secondaryHref}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 text-[13px] font-bold tracking-[0.1em] uppercase transition-all duration-500 hover:bg-white hover:text-navy hover:-translate-y-0.5"
            >
              {secondaryLabel}
            </Link>
          </div>
          <p className="mt-8 text-[12px] font-medium tracking-wide text-white/50 uppercase">
            No obligation · No call-centre · Replies in &lt; 4 hours
          </p>
        </motion.div>
      </Container>
    </section>
  );
}

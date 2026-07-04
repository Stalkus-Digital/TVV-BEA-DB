"use client";

import { Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Stars } from "@/components/ui/Stars";
import type { Review } from "@/lib/models";

interface TestimonialStripProps {
  reviews: Review[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] },
  },
};

export function TestimonialStrip({
  reviews,
  eyebrow = "Travellers, on us",
  title = "A reputation built on the smallest details.",
  description = "What real travellers wrote when they came home. Verified reviews only.",
}: TestimonialStripProps) {
  if (!reviews || reviews.length === 0) return null;
  return (
    <Section tone="surface" pad="default">
      <Container>
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {reviews.map((r) => (
            <motion.figure
              variants={itemVariants}
              key={r.name}
              className="flex h-full flex-col rounded-[24px] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            >
              <Quote className="h-6 w-6 fill-gold text-gold opacity-80" aria-hidden />
              <Stars value={r.rating} className="mt-4" />
              <p className="mt-5 font-display text-[20px] leading-snug text-ink">{r.title}</p>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-ink-secondary text-pretty">
                "{r.body}"
              </blockquote>
              <figcaption className="mt-auto pt-8">
                <div className="h-[1px] w-12 bg-line mb-4" aria-hidden />
                <p className="text-[14px] font-semibold tracking-tight text-ink">{r.name}</p>
                <p className="text-[12px] text-ink-muted mt-0.5">
                  {r.location} · {r.date}
                  {r.tour && ` · ${r.tour}`}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}

"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface TrustStat {
  value: string;
  label: string;
}

interface TrustBarProps {
  stats: TrustStat[];
}

export function TrustBar({ stats }: TrustBarProps) {
  if (!stats || stats.length === 0) return null;
  return (
    <section className="border-y border-line/40 bg-surface/30">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-2 divide-line/40 lg:grid-cols-4 lg:divide-x">
          {stats.map((s, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
              key={s.label}
              className={`flex flex-col items-start gap-1 px-2 py-10 sm:px-8 ${i < 2 ? "border-b border-line/40 lg:border-b-0" : ""}`}
            >
              <span className="inline-flex items-center gap-2 font-display text-[32px] font-medium tracking-tight text-ink">
                {s.value.includes("★") ? (
                  <>
                    {s.value.replace("★", "")}
                    <Star className="h-5 w-5 fill-gold text-gold opacity-90" strokeWidth={0} aria-hidden />
                  </>
                ) : (
                  s.value
                )}
              </span>
              <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-ink-muted/80">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

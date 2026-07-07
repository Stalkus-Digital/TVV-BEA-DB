"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

interface StickyCTAProps {
  label: string;
  href: string;
}

export function StickyCTA({ label, href }: StickyCTAProps) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Show after scrolling past the hero (approx 600px)
    if (latest > 600) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: visible ? 0 : 100, opacity: visible ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
    >
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md px-8 py-3.5 text-[14px] font-bold tracking-[0.1em] text-navy uppercase shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-gold hover:text-white hover:shadow-[0_12px_40px_rgba(197,160,89,0.3)] hover:-translate-y-1"
      >
        {label}
      </Link>
    </motion.div>
  );
}

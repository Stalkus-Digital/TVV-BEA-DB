"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function ConciergeWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 700);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  const whatsappHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    "Hello TVV, I'd like to plan a journey.",
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
            className="w-[300px] overflow-hidden rounded-xl border border-line bg-white shadow-modal"
            role="dialog"
            aria-label="Concierge"
          >
            <div className="flex items-center gap-3 bg-navy px-4 py-4 text-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal text-white text-[13px] font-semibold">VV</span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold">Speak to a specialist</p>
                <p className="text-[11px] text-white/60">Mon–Sun · Replies within 10 min</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-gold/90">
                  A specialist travel house · Est. 2008
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close concierge"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="space-y-2 p-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-md border border-line p-3 hover:border-teal hover:bg-teal-light"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/10 text-[#128C7E]">
                  <MessageCircle className="h-4 w-4" aria-hidden />
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-ink">WhatsApp</p>
                  <p className="text-[11px] text-ink-muted">Instant replies, share dates</p>
                </div>
              </a>
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 rounded-md border border-line p-3 hover:border-teal hover:bg-teal-light"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-light text-teal">
                  <Phone className="h-4 w-4" aria-hidden />
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-ink">Call us</p>
                  <p className="text-[11px] text-ink-muted">{SITE.phone}</p>
                </div>
              </a>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-md bg-teal py-2.5 text-[13px] font-medium text-white hover:bg-teal-hover"
              >
                Request a private consultation →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label={open ? "Close concierge" : "Open concierge"}
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className={cn(
          "group inline-flex h-14 items-center gap-2.5 rounded-pill bg-navy pl-4 pr-5 text-white shadow-modal transition-all duration-base hover:bg-navy-soft",
          "ring-1 ring-white/10",
        )}
      >
        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal text-white">
          <MessageCircle className="h-4 w-4" aria-hidden />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-navy" />
        </span>
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/55">Concierge</span>
          <span className="text-[13px] font-semibold">Plan with a specialist</span>
        </span>
      </button>
    </div>
  );
}

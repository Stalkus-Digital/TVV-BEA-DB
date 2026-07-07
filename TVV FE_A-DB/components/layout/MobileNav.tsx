"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navGroups } from "./nav-data";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-navy/90 backdrop-blur-xl text-white lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>

            <div className="h-[calc(100vh-5rem)] overflow-y-auto pb-32 pt-8 px-6 no-scrollbar">
              <ul className="space-y-6">
                {navGroups.map((g) => {
                  const hasChildren = !!g.mega;
                  const isOpen = expanded === g.label;
                  return (
                    <li key={g.label} className="border-b border-white/10 pb-6 last:border-0">
                      <div className="flex items-center justify-between">
                        <Link
                          href={g.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex-1 font-display text-[32px] tracking-tight transition-colors",
                            g.label === "Andaman" ? "text-gold" : "text-white",
                          )}
                        >
                          {g.label}
                        </Link>
                        {hasChildren && (
                          <button
                            onClick={() => setExpanded(isOpen ? null : g.label)}
                            aria-label={`Toggle ${g.label} submenu`}
                            aria-expanded={isOpen}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <ChevronDown
                              className={cn(
                                "h-5 w-5 transition-transform duration-300",
                                isOpen && "rotate-180 text-gold",
                              )}
                              aria-hidden
                            />
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {isOpen && g.mega && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-8 pt-8 pb-4">
                              {g.mega.columns.map((col) => (
                                <div key={col.title}>
                                  <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-white/50">
                                    {col.title}
                                  </p>
                                  <ul className="space-y-4">
                                    {col.links.map((link) => (
                                      <li key={link.href}>
                                        <Link
                                          href={link.href}
                                          onClick={() => setOpen(false)}
                                          className="block text-[17px] font-medium text-white/80 transition-colors hover:text-white"
                                        >
                                          {link.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-12 space-y-4">
                <ButtonLink href="/contact" fullWidth size="lg" className="h-14 rounded-full text-[14px] uppercase tracking-widest font-bold">
                  Plan My Journey
                </ButtonLink>
                <ButtonLink href="/contact" variant="outline-light" fullWidth size="lg" className="h-14 rounded-full text-[14px] uppercase tracking-widest font-bold">
                  Talk to a Specialist
                </ButtonLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { navGroups } from "./nav-data";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { SITE } from "@/lib/seo";

export function Navbar() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenKey(null), 120);
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }
  function openMenu(key: string) {
    cancelClose();
    setOpenKey(key);
  }

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  return (
    <motion.header 
      style={{
        background: "rgba(10, 22, 40, 0.9)",
        backdropFilter: "blur(16px)",
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
        borderBottomWidth: "1px",
      }}
      className="fixed inset-x-0 top-0 z-40 text-white"
    >
      <div className="relative mx-auto flex h-[80px] max-w-[1400px] items-center gap-8 px-6 lg:px-10">
        <Logo />

        <nav className="hidden flex-1 lg:flex" aria-label="Primary">
          <ul className="flex items-center gap-2">
            {navGroups.map((g) => {
              const hasMega = !!g.mega;
              const isActive = openKey === g.label;
              return (
                <li
                  key={g.label}
                  className="static"
                  onMouseEnter={() => hasMega && openMenu(g.label)}
                  onMouseLeave={scheduleClose}
                >
                  <Link
                    href={g.href}
                    className={cn(
                      "relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-medium transition-all duration-300",
                      "text-white/90 hover:bg-white/10 hover:text-white hover:backdrop-blur-md",
                      isActive && "text-white bg-white/15 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
                      g.label === "Andaman" && "text-gold hover:text-gold",
                    )}
                    onFocus={() => hasMega && openMenu(g.label)}
                  >
                    {g.label}
                    {hasMega && (
                      <ChevronDown className={cn("h-3.5 w-3.5 opacity-70 transition-transform duration-300", isActive && "rotate-180")} aria-hidden />
                    )}
                  </Link>
                  {hasMega && (
                    <MegaMenu
                      group={g}
                      open={isActive}
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="hidden items-center gap-2 text-[13px] font-medium text-white/70 transition-colors hover:text-white sm:inline-flex"
          >
            <Phone className="h-4 w-4" aria-hidden />
            <span>{SITE.phone}</span>
          </a>
          <Link
            href="/contact"
            className="hidden lg:inline-flex items-center justify-center rounded-full bg-white text-navy px-7 py-2.5 text-[12px] font-bold tracking-[0.1em] uppercase transition-all duration-500 hover:bg-gold hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] hover:-translate-y-0.5"
          >
            Plan My Journey
          </Link>
          <MobileNav />
        </div>
      </div>
    </motion.header>
  );
}

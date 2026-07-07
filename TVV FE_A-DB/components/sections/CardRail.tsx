"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroll rail used for tour-card carousels on all hub pages.
 * Mobile = native scroll; desktop = grid.
 */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1],
    },
  },
};

export function CardRail({
  children,
  className,
  asGrid = true,
}: {
  children: ReactNode;
  className?: string;
  asGrid?: boolean;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "-mx-6 flex gap-6 overflow-x-auto snap-x snap-mandatory px-6 pb-4 no-scrollbar",
        asGrid && "sm:mx-0 sm:overflow-visible sm:px-0 sm:grid sm:grid-cols-2 sm:snap-none lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function CardRailItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className={cn("w-[300px] shrink-0 snap-start sm:w-auto", className)}>
      {children}
    </motion.div>
  );
}

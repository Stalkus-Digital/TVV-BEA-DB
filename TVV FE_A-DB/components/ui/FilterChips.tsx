"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ChipOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  options: ChipOption[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function FilterChips({
  options,
  defaultValue,
  onChange,
  className,
  ariaLabel = "Filters",
}: FilterChipsProps) {
  const [active, setActive] = useState<string>(defaultValue ?? options[0]?.value ?? "");
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex w-full gap-2 overflow-x-auto scroll-rail",
        className,
      )}
    >
      {options.map((o) => {
        const isActive = active === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              setActive(o.value);
              onChange?.(o.value);
            }}
            className={cn(
              "relative shrink-0 px-4 py-2 text-[14px] font-medium transition-colors duration-300",
              isActive
                ? "text-teal"
                : "text-ink-secondary hover:text-ink",
            )}
          >
            {o.label}
            {isActive && (
              <motion.div
                layoutId="activeFilterIndicator"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-teal"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

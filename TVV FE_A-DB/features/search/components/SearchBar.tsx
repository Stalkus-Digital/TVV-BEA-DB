"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DEFAULT_SEARCH_FILTERS } from "../types";
import { searchPath } from "../paths";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { useSearchQuery } from "../hooks/useSearchQuery";
import { LiveSearchPanel } from "./LiveSearchPanel";

interface SearchBarProps {
  placeholder?: string;
  ctaLabel?: string;
  size?: "hero" | "inline";
  className?: string;
  /** Pre-fill from URL when used on the search results page. */
  defaultValue?: string;
  /** Show debounced live suggestions while typing. */
  liveSearch?: boolean;
}

export function SearchBar({
  placeholder = "Search destinations, journeys, experiences…",
  ctaLabel = "Explore",
  size = "hero",
  className,
  defaultValue = "",
  liveSearch = true,
}: SearchBarProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(value, 280);
  const { items: recent, add: addRecent, remove: removeRecent } = useRecentSearches();

  const { data, isLoading, isError } = useSearchQuery(debounced, DEFAULT_SEARCH_FILTERS, {
    enabled: liveSearch && open && debounced.trim().length >= 2,
  });

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function submit(next?: string) {
    const q = (next ?? value).trim();
    if (!q) return;
    addRecent(q);
    setOpen(false);
    router.push(searchPath(q));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit();
  }

  const isHero = size === "hero";

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <form
        onSubmit={onSubmit}
        className={cn(
          "group flex w-full items-center gap-2 rounded-pill bg-white shadow-hover transition-all duration-base focus-within:ring-2 focus-within:ring-teal/40",
          isHero ? "h-[60px] pl-5 pr-1.5 sm:h-[64px]" : "h-12 pl-4 pr-1",
        )}
        role="search"
        aria-label="Search The Vacation Voice"
      >
        <Search className="h-5 w-5 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden />
        <input
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent text-ink outline-none placeholder:text-ink-muted",
            isHero ? "text-[15px] sm:text-base" : "text-sm",
          )}
          aria-label="Search query"
          aria-expanded={liveSearch && open}
          aria-controls={liveSearch && open ? "live-search-panel" : undefined}
          autoComplete="off"
        />
        <button
          type="submit"
          className={cn(
            "shrink-0 rounded-pill bg-teal font-medium text-white transition-colors duration-fast hover:bg-teal-hover",
            isHero ? "h-12 px-6 text-sm sm:text-[15px]" : "h-10 px-5 text-[13px]",
          )}
        >
          {ctaLabel}
        </button>
      </form>

      {liveSearch && open && (
        <div id="live-search-panel">
          <LiveSearchPanel
            query={value}
            results={data}
            recent={recent}
            isLoading={isLoading}
            isError={isError}
            onRecentSelect={submit}
            onRecentRemove={removeRecent}
          />
        </div>
      )}
    </div>
  );
}

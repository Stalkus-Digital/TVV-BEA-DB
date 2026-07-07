import { MapPin, Moon, Sunrise } from "lucide-react";
import type { ItineraryDay } from "@/lib/models";

interface PackageItineraryProps {
  days: ItineraryDay[];
}

export function PackageItinerary({ days }: PackageItineraryProps) {
  return (
    <div className="border-t border-line/40">
      {days.map((day, index) => (
        <details
          key={day.day}
          open={index === 0}
          className="group border-b border-line/40 bg-white transition-colors hover:bg-cream/20"
        >
          <summary className="flex cursor-pointer items-start gap-6 px-2 py-6 lg:items-center lg:px-6 [&::-webkit-details-marker]:hidden">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal/5 font-display text-[18px] text-teal">
              {String(day.day).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-muted">Day {day.day}</p>
              <p className="mt-1 font-display text-[22px] leading-snug text-ink">{day.title}</p>
            </div>
            <span className="hidden items-center gap-2 text-[13px] font-medium tracking-wide text-ink-secondary sm:inline-flex">
              <MapPin className="h-3.5 w-3.5 text-teal" aria-hidden /> {day.city}
            </span>
            <span
              aria-hidden
              className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line/60 text-ink-muted transition-transform duration-300 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="space-y-4 px-2 pb-8 pl-[5rem] lg:px-6 lg:pl-[6.5rem]">
            <p className="max-w-3xl text-[16px] leading-[1.8] text-ink-secondary text-pretty">{day.description}</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2 text-[13px] font-medium text-ink-secondary">
              {day.stay && (
                <span className="inline-flex items-center gap-2">
                  <Moon className="h-4 w-4 text-teal" aria-hidden /> Stay: {day.stay}
                </span>
              )}
              {day.meals && (
                <span className="inline-flex items-center gap-2">
                  <Sunrise className="h-4 w-4 text-teal" aria-hidden /> {day.meals}
                </span>
              )}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

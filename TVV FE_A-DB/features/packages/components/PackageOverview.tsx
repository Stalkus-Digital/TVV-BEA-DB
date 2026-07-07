import { Calendar, Clock, MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Stars } from "@/components/ui/Stars";
import { FadeUp, FadeUpItem } from "@/components/ui/FadeUp";
import type { Package } from "@/lib/models";

interface PackageOverviewHeaderProps {
  pkg: Package;
}

export function PackageOverviewHeader({ pkg }: PackageOverviewHeaderProps) {
  return (
    <FadeUp stagger>
      <FadeUpItem>
        <div className="flex flex-wrap items-center gap-2">
          {pkg.badges?.map((badge) => (
            <Badge
              key={badge}
              tone={
                badge === "exclusive" || badge === "staff-pick"
                  ? "gold"
                  : badge === "flash-sale"
                    ? "warn"
                    : badge === "limited-seats"
                      ? "danger"
                      : "info"
              }
            >
              {badge.replace("-", " ")}
            </Badge>
          ))}
        </div>
      </FadeUpItem>
      <FadeUpItem>
        <h1 className="mt-5 font-display text-[clamp(2.5rem,4.5vw,4rem)] leading-[1.05] tracking-tight text-balance text-ink">
          {pkg.title}
        </h1>
      </FadeUpItem>
      {pkg.subtitle && (
        <FadeUpItem>
          <p className="mt-4 text-[18px] leading-relaxed text-ink-secondary text-pretty">{pkg.subtitle}</p>
        </FadeUpItem>
      )}
      <FadeUpItem>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-lg border border-line/40 bg-white/50 p-6 text-[14px] font-medium text-ink-secondary shadow-card">
          {typeof pkg.rating === "number" && <Stars value={pkg.rating} count={pkg.ratingCount} size="md" />}
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal" aria-hidden /> {pkg.durationDays}D / {pkg.durationNights}N
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal" aria-hidden /> {pkg.destination}
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-teal" aria-hidden /> Private departures
          </span>
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal" aria-hidden /> Year-round, customised
          </span>
        </div>
      </FadeUpItem>
      <FadeUpItem>
        <div className="mt-6 flex flex-wrap gap-2">
          {pkg.destinations.map((dest) => (
            <span
              key={`${dest.days}-${dest.city}`}
              className="inline-flex items-center rounded-full bg-teal/5 px-4 py-1.5 text-[12px] font-bold uppercase tracking-widest text-teal"
            >
              {dest.days}D {dest.city}
            </span>
          ))}
        </div>
      </FadeUpItem>
    </FadeUp>
  );
}

interface PackageOverviewBodyProps {
  pkg: Package;
}

export function PackageOverviewBody({ pkg }: PackageOverviewBodyProps) {
  return (
    <section>
      <h2 className="font-display text-[32px] text-ink">Overview</h2>
      <p className="mt-6 text-[18px] leading-[1.9] text-ink-secondary text-pretty">
        {pkg.description ??
          `${pkg.title} is a ${pkg.durationDays}-day, ${pkg.durationNights}-night journey through ${pkg.destination}, designed by a TVV specialist who knows the route. The itinerary balances movement with stillness — private experiences in the morning, room to breathe in the afternoon.`}
      </p>
      {pkg.highlights && pkg.highlights.length > 0 && (
        <div className="mt-8 rounded-xl border border-line/40 bg-white p-8 shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-teal">Highlights</p>
          <ul className="mt-5 space-y-4">
            {pkg.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-4 text-[16px] text-ink-secondary">
                <Star className="mt-1 h-4 w-4 shrink-0 fill-gold text-gold" strokeWidth={0} aria-hidden />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

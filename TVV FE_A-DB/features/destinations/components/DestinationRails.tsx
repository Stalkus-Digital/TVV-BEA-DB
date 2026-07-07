import Link from "next/link";
import Image from "next/image";
import type { FerryRouteNode, FlightRouteNode, GuideNode, HotelNode, PackageNode } from "../types";

export function PackagesRail({
  title,
  packages,
  emptyHint,
}: {
  title: string;
  packages: PackageNode[];
  emptyHint?: string;
}) {
  if (packages.length === 0 && !emptyHint) return null;

  return (
    <section className="bg-cream py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <h2 className="font-display text-[32px] leading-tight text-ink">{title}</h2>
        {packages.length === 0 ? (
          <p className="mt-4 text-[15px] text-ink-secondary">{emptyHint}</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/packages/${pkg.slug}`}
                className="group overflow-hidden rounded-xl bg-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  {pkg.heroImageUrl ? (
                    <Image
                      src={pkg.heroImageUrl}
                      alt={pkg.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-navy/10">
                      <span className="text-sm text-ink-muted">{pkg.title}</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-gold">
                    {pkg.durationNights ? `${pkg.durationNights}N ${pkg.durationDays ?? pkg.durationNights + 1}D` : "Package"}
                  </p>
                  <h3 className="mt-2 font-display text-[20px] leading-tight text-ink">{pkg.title}</h3>
                  {pkg.shortDescription && (
                    <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-secondary">
                      {pkg.shortDescription}
                    </p>
                  )}
                  {pkg.startingPrice && (
                    <p className="mt-4 text-[13px] font-medium text-ink">
                      From ₹{pkg.startingPrice.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function GuidesRail({ title, guides }: { title: string; guides: GuideNode[] }) {
  if (guides.length === 0) return null;

  return (
    <section className="bg-cream py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <h2 className="font-display text-[32px] leading-tight text-ink">{title}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.slug}`}
              className="group flex gap-5 overflow-hidden rounded-lg bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              {guide.heroImageUrl && (
                <div className="relative h-28 w-32 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={guide.heroImageUrl}
                    alt={guide.title}
                    fill
                    sizes="128px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.15em] text-gold">
                  Guide{guide.readingMinutes ? ` · ${guide.readingMinutes} min read` : ""}
                </p>
                <h3 className="mt-1 font-display text-[18px] leading-snug text-ink">{guide.title}</h3>
                {guide.excerpt && (
                  <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-secondary">{guide.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HotelsRail({ title, hotels }: { title: string; hotels: HotelNode[] }) {
  if (hotels.length === 0) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <h2 className="font-display text-[32px] leading-tight text-ink">{title}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <Link
              key={hotel.id}
              href={`/hotels/${hotel.slug}`}
              className="group overflow-hidden rounded-xl bg-cream shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-hover"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                {hotel.heroImageUrl ? (
                  <Image
                    src={hotel.heroImageUrl}
                    alt={hotel.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-navy/10">
                    <span className="text-sm text-ink-muted">{hotel.name}</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                {hotel.starRating !== null && (
                  <p className="text-[12px] tracking-[0.2em] text-gold">{"★".repeat(hotel.starRating)}</p>
                )}
                <h3 className="mt-2 font-display text-[20px] leading-tight text-ink">{hotel.name}</h3>
                {hotel.shortDescription && (
                  <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-secondary">
                    {hotel.shortDescription}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FerriesAndFlightsRail({
  destinationName,
  ferries,
  flights,
}: {
  destinationName: string;
  ferries: FerryRouteNode[];
  flights: FlightRouteNode[];
}) {
  if (ferries.length === 0 && flights.length === 0) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <h2 className="font-display text-[32px] leading-tight text-ink">Getting around — {destinationName}</h2>
        <div className="mt-10 grid gap-12 md:grid-cols-2">
          {flights.length > 0 && (
            <div>
              <h3 className="mb-4 text-[12px] uppercase tracking-[0.2em] text-gold">Flights to {destinationName}</h3>
              <ul className="space-y-3">
                {flights.map((flight) => (
                  <li
                    key={flight.id}
                    className="flex items-baseline justify-between border-b border-ink/10 pb-3 last:border-b-0"
                  >
                    <span className="font-medium text-ink">
                      {flight.originCity} ({flight.originIATA}) → {flight.destCity} ({flight.destIATA})
                    </span>
                    {flight.startingPrice && (
                      <span className="text-[14px] text-ink-secondary">
                        From ₹{flight.startingPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ferries.length > 0 && (
            <div>
              <h3 className="mb-4 text-[12px] uppercase tracking-[0.2em] text-gold">Ferry routes</h3>
              <ul className="space-y-3">
                {ferries.map((ferry) => (
                  <li
                    key={ferry.id}
                    className="flex items-baseline justify-between border-b border-ink/10 pb-3 last:border-b-0"
                  >
                    <span className="font-medium text-ink">
                      {ferry.originName} ⇄ {ferry.destinationName}
                      {ferry.operatorName && <span className="text-ink-muted"> · {ferry.operatorName}</span>}
                    </span>
                    {ferry.startingPrice && (
                      <span className="text-[14px] text-ink-secondary">
                        From ₹{ferry.startingPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

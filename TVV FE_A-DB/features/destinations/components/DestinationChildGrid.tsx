import Link from "next/link";
import Image from "next/image";
import type { DestinationChildCard } from "../types";

interface DestinationChildGridProps {
  title: string;
  emptyHint?: string;
  items: DestinationChildCard[];
}

export function DestinationChildGrid({ title, emptyHint, items }: DestinationChildGridProps) {
  if (items.length === 0) {
    if (!emptyHint) return null;
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <p className="text-[15px] text-ink-secondary">{emptyHint}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <h2 className="font-display text-[32px] leading-tight text-ink">{title}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative overflow-hidden rounded-xl bg-navy/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-cream">
                    <span className="font-display text-sm text-ink-muted">{item.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/70">{item.eyebrow}</p>
                  <p className="mt-1 font-display text-[20px] leading-tight">{item.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

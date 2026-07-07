"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartOff } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { packageDetailPath } from "@/features/packages";
import type { WishlistItem } from "@/lib/api/users";
import { useWishlistMutations, useWishlistQuery } from "../hooks/useWishlistMutations";
import { DashboardShell } from "./DashboardShell";

function WishlistCard({ item, onRemove }: { item: WishlistItem; onRemove: (slug: string) => void }) {
  const href = packageDetailPath(item.packageSlug);
  const image = item.heroImage ?? "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=800&q=80";

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
      <Link href={href} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={image}
            alt={item.title ?? item.packageSlug}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="p-5">
          <p className="font-display text-[18px] text-ink">{item.title ?? item.packageSlug}</p>
          {item.startsFrom != null && item.startsFrom > 0 && (
            <p className="mt-1 text-[13px] text-ink-secondary">From {formatINR(item.startsFrom)}</p>
          )}
        </div>
      </Link>
      <div className="border-t border-line/40 px-5 py-3">
        <button
          type="button"
          onClick={() => onRemove(item.packageSlug)}
          className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-ink-muted transition hover:text-danger"
        >
          <HeartOff className="h-4 w-4" aria-hidden />
          Remove
        </button>
      </div>
    </article>
  );
}

export function WishlistPage() {
  const { data: items = [], isLoading, isError, error } = useWishlistQuery();
  const { remove } = useWishlistMutations();

  return (
    <DashboardShell>
      <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight tracking-tight text-ink">
        Wishlist
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
        Journeys you have saved — ready when you are.
      </p>

      {isError && (
        <div className="mt-6 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error instanceof Error ? error.message : "Failed to load wishlist"}
        </div>
      )}

      {isLoading && <p className="mt-8 text-[14px] text-ink-muted">Loading your wishlist…</p>}

      {!isLoading && !isError && items.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-white p-8 text-center">
          <p className="font-display text-[20px] text-ink">Nothing saved yet.</p>
          <p className="mt-2 text-[14px] text-ink-secondary">
            Tap the heart on any package to save it here.
          </p>
          <Link
            href="/packages/domestic"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-teal px-7 text-[13px] font-bold uppercase tracking-wider text-white transition hover:bg-teal-hover"
          >
            Explore packages
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <WishlistCard
              key={item.packageSlug}
              item={item}
              onRemove={(slug) => remove.mutate(slug)}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/features/auth";
import { cn } from "@/lib/utils";
import { useWishlistMutations, useWishlistQuery } from "../hooks/useWishlistMutations";

interface PackageWishlistToggleProps {
  packageSlug: string;
  className?: string;
}

export function PackageWishlistToggle({ packageSlug, className }: PackageWishlistToggleProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";

  // No `/api/me/wishlist` backend endpoint exists yet (see docs/37_PLATFORM_INTEGRATION_AUDIT.md);
  // disabled here to avoid firing a guaranteed-to-fail request on every wishlist-heart render.
  const { data: wishlist = [] } = useWishlistQuery({ enabled: false });
  const { add, remove } = useWishlistMutations();

  const saved = useMemo(
    () => wishlist.some((item) => item.packageSlug === packageSlug),
    [wishlist, packageSlug],
  );

  const pending = add.isPending || remove.isPending;

  function onClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (saved) remove.mutate(packageSlug);
    else add.mutate(packageSlug);
  }

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      disabled={pending}
      className={cn(
        "absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/20 text-white shadow-card backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:text-danger disabled:opacity-60",
        saved && "bg-white text-danger",
        className,
      )}
      onClick={onClick}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} strokeWidth={2} aria-hidden />
    </button>
  );
}

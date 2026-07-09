/**
 * SSG path helpers — prefer Travel OS at build time; mock slugs only when
 * `NEXT_PUBLIC_USE_MOCK=true`.
 */

import { apiConfig } from "@/lib/api";
import { fetchDestinations } from "@/lib/api/destinations";
import { fetchPackages } from "@/lib/api/packages";

export async function packageStaticSlugs(): Promise<string[]> {
  if (!apiConfig.useMock) {
    try {
      const rows = await fetchPackages({ limit: "200" });
      if (rows.length > 0) return rows.map((p) => p.slug);
    } catch {
      // Travel OS may be unavailable during CI/build — pages stay on-demand.
    }
    return [];
  }

  return [];
};

export async function destinationStaticSlugs(): Promise<string[]> {
  if (!apiConfig.useMock) {
    try {
      const rows = await fetchDestinations();
      return rows.filter((d) => d.slug !== "andaman").map((d) => d.slug);
    } catch {
      return [];
    }
  }

  return [];
}

export async function experienceStaticSlugs(): Promise<string[]> {
  if (!apiConfig.useMock) return [];
  const { experiencesMock } = await import("@/lib/mock");
  return experiencesMock.map((e) => e.slug);
}

export async function guideStaticSlugs(): Promise<string[]> {
  if (!apiConfig.useMock) return [];
  const { guidesMock } = await import("@/lib/mock");
  return guidesMock.map((g) => g.slug);
}

export async function ferryRouteStaticSlugs(): Promise<string[]> {
  if (!apiConfig.useMock) return [];
  const { ferryRoutesMock } = await import("@/lib/mock");
  return ferryRoutesMock.map((r) => r.slug);
}

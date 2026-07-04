import { describe, expect, it } from "vitest";
import { isOk } from "@/shared/types";
import { getHomepageService } from "@/modules/website";
import { getDestinationService } from "@/modules/destination";
import { getPackageService, getPackagePricingService } from "@/modules/package";

describe("HomepageService — regression: empty destination/price on package cards (Sprint 7 bug)", () => {
  it("featured/latest package cards are enriched with a real destinationName and fromPrice, never blank", async () => {
    // Original bug: getHomepage() called the bare transformer directly with
    // (pkg, null, null, null) to skip enrichment cost, so every card on the
    // homepage showed destinationName: "" and fromPrice: null. Fixed by
    // exposing WebsitePackageService.toSummaryDTO() and reusing it here.
    const destination = await getDestinationService().create({ name: `Homepage Regression Destination ${Date.now()}`, countryId: "country-1" });
    if (!isOk(destination)) throw new Error("destination setup failed");

    const pkg = await getPackageService().create({
      title: `Homepage Regression Package ${Date.now()}`,
      destinationId: destination.value.id,
      durationDays: 4,
      durationNights: 3,
    });
    if (!isOk(pkg)) throw new Error("package setup failed");

    await getPackagePricingService().upsert(pkg.value.id, { basePrice: 45_000, currency: "INR", markup: null, discount: null, tax: null });
    await getPackageService().publish(pkg.value.id);

    const homepage = await getHomepageService().getHomepage();
    expect(isOk(homepage)).toBe(true);
    if (!isOk(homepage)) return;

    const card = [...homepage.value.featuredPackages, ...homepage.value.latestPackages].find((p) => p.slug === pkg.value.slug);
    expect(card).toBeDefined();
    expect(card?.destinationName).toBe(destination.value.name);
    expect(card?.destinationName).not.toBe("");
    // toSummaryDTO() computes a live price via getPackagePricingService().compute()
    // at the default pax count (2), not the raw basePrice — 45,000 base × 2 pax.
    expect(card?.fromPrice).toBe(90_000);
    expect(card?.fromPrice).not.toBeNull();
  });
});

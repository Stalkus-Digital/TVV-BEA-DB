import { describe, expect, it } from "vitest";
import { toDestinationDetail, toDestinationSummary, toWebsiteBreadcrumbs } from "@/modules/website/transformers/destination.transformer";
import type { Destination } from "@/modules/destination";

function buildDestination(overrides: Partial<Destination> = {}): Destination {
  return {
    id: "dest-1",
    name: "Havelock Island",
    slug: "havelock-island",
    countryId: "country-1",
    stateId: null,
    cityId: null,
    regionId: null,
    parentDestinationId: null,
    categoryIds: [],
    description: null,
    isFeatured: false,
    latitude: null,
    longitude: null,
    seo: {},
    gallery: [],
    faqs: [],
    guideReferenceIds: [],
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("toDestinationSummary", () => {
  it("prefers seo.ogImageUrl over the first gallery image for heroImage", () => {
    const destination = buildDestination({
      seo: { ogImageUrl: "https://cdn.example.com/og.jpg" },
      gallery: [{ id: "g1", url: "https://cdn.example.com/gallery1.jpg", position: 0 }],
    });
    expect(toDestinationSummary(destination).heroImage).toBe("https://cdn.example.com/og.jpg");
  });

  it("falls back to the first gallery image when no ogImageUrl is set", () => {
    const destination = buildDestination({ gallery: [{ id: "g1", url: "https://cdn.example.com/gallery1.jpg", position: 0 }] });
    expect(toDestinationSummary(destination).heroImage).toBe("https://cdn.example.com/gallery1.jpg");
  });

  it("heroImage is null when neither exists — never an empty string", () => {
    expect(toDestinationSummary(buildDestination()).heroImage).toBeNull();
  });

  it("never leaks internal fields (guideReferenceIds, status, categoryIds) into the summary DTO", () => {
    const summary = toDestinationSummary(buildDestination());
    expect(summary).not.toHaveProperty("guideReferenceIds");
    expect(summary).not.toHaveProperty("status");
    expect(Object.keys(summary).sort()).toEqual(["heroImage", "name", "slug"]);
  });
});

describe("toWebsiteBreadcrumbs", () => {
  it("maps a Destination breadcrumb chain into label/url pairs", () => {
    const result = toWebsiteBreadcrumbs([
      { id: "1", name: "Andaman Islands", slug: "andaman-islands" },
      { id: "2", name: "Havelock Island", slug: "havelock-island" },
    ]);
    expect(result).toEqual([
      { label: "Andaman Islands", url: "/destination/andaman-islands" },
      { label: "Havelock Island", url: "/destination/havelock-island" },
    ]);
  });

  it("an empty chain produces an empty array", () => {
    expect(toWebsiteBreadcrumbs([])).toEqual([]);
  });
});

describe("toDestinationDetail", () => {
  it("assembles gallery URLs, FAQ question/answer pairs, and always-empty guides", () => {
    const destination = buildDestination({
      gallery: [{ id: "g1", url: "https://cdn.example.com/1.jpg", position: 0 }],
      faqs: [{ id: "f1", question: "Q?", answer: "A.", position: 0 }],
      guideReferenceIds: ["guide-1"], // present internally, must never surface in the DTO
    });

    const detail = toDestinationDetail({ destination, featuredPackages: [], nearbyDestinations: [], breadcrumbs: [], baseUrl: "https://x.com" });

    expect(detail.gallery).toEqual(["https://cdn.example.com/1.jpg"]);
    expect(detail.faqs).toEqual([{ question: "Q?", answer: "A." }]);
    expect(detail.guides).toEqual([]);
  });

  it("falls back the SEO description to a generated 'Explore {name}' string when the destination has none", () => {
    const destination = buildDestination({ description: null });
    const detail = toDestinationDetail({ destination, featuredPackages: [], nearbyDestinations: [], breadcrumbs: [], baseUrl: "https://x.com" });
    expect(detail.seo.description).toBe("Explore Havelock Island");
  });

  it("nearbyDestinations are transformed through toDestinationSummary, not passed through raw", () => {
    const nearby = buildDestination({ id: "dest-2", name: "Neil Island", slug: "neil-island" });
    const detail = toDestinationDetail({ destination: buildDestination(), featuredPackages: [], nearbyDestinations: [nearby], breadcrumbs: [], baseUrl: "https://x.com" });
    expect(detail.nearbyDestinations).toEqual([{ name: "Neil Island", slug: "neil-island", heroImage: null }]);
  });
});

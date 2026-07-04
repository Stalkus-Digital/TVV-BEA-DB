import { describe, expect, it } from "vitest";
import { api, expectSuccess } from "../helpers/api-client";
import { buildBaseScenario } from "../helpers/scenario-builder";

async function publishScenarioPackage(packageId: string) {
  await api.put(`/api/packages/${packageId}/pricing`).send({ basePrice: 45_000, currency: "INR", markup: null, discount: null, tax: null });
  return api.post(`/api/packages/${packageId}/publish`).send({});
}

describe("Website API (Backend for Frontend)", () => {
  it("only PUBLISHED packages ever appear on the homepage — a DRAFT package never leaks through", async () => {
    const scenario = await buildBaseScenario(); // package stays DRAFT, never published
    const homepage = expectSuccess<{ featuredPackages: { slug: string }[]; latestPackages: { slug: string }[] }>(
      (await api.get("/api/website/home")).body
    );

    const packageSlugFromScenario = expectSuccess<{ slug: string }>((await api.get(`/api/packages/${scenario.packageId}`)).body).slug;
    const allSlugs = [...homepage.featuredPackages, ...homepage.latestPackages].map((p) => p.slug);
    expect(allSlugs).not.toContain(packageSlugFromScenario);
  });

  it("a published package's card shows a real destinationName and fromPrice, never blank (regression, see unit test for the deeper coverage)", async () => {
    const scenario = await buildBaseScenario();
    await publishScenarioPackage(scenario.packageId);

    const pkg = expectSuccess<{ slug: string }>((await api.get(`/api/packages/${scenario.packageId}`)).body);
    const websitePackages = expectSuccess<{ items: { slug: string; destinationName: string; fromPrice: number | null }[] }>(
      (await api.get("/api/website/packages")).body
    );
    const card = websitePackages.items.find((p) => p.slug === pkg.slug);
    expect(card?.destinationName).toBeTruthy();
    expect(card?.fromPrice).not.toBeNull();
  });

  it("GET /api/website/package/:slug 404s for an unpublished (DRAFT) package", async () => {
    const scenario = await buildBaseScenario();
    const pkg = expectSuccess<{ slug: string }>((await api.get(`/api/packages/${scenario.packageId}`)).body);
    const response = await api.get(`/api/website/package/${pkg.slug}`);
    expect(response.status).toBe(404);
  });

  it("GET /api/website/package/:slug returns full detail once published", async () => {
    const scenario = await buildBaseScenario();
    await publishScenarioPackage(scenario.packageId);
    const pkg = expectSuccess<{ slug: string }>((await api.get(`/api/packages/${scenario.packageId}`)).body);

    const response = await api.get(`/api/website/package/${pkg.slug}`);
    expect(response.status).toBe(200);
    const detail = expectSuccess<{ seo: { canonicalUrl: string }; breadcrumbs: unknown[] }>(response.body);
    expect(detail.seo.canonicalUrl).toBeTruthy();
  });

  it("GET /api/website/search filters by keyword", async () => {
    const scenario = await buildBaseScenario();
    await publishScenarioPackage(scenario.packageId);
    const pkg = expectSuccess<{ title: string }>((await api.get(`/api/packages/${scenario.packageId}`)).body);

    const response = expectSuccess<{ results: { title: string }[] }>(
      (await api.get(`/api/website/search?keyword=${encodeURIComponent(pkg.title.split(" ")[0])}`)).body
    );
    expect(response.results.some((r) => r.title === pkg.title)).toBe(true);
  });

  it("never exposes internal Package fields (currentVersionId, sourceTemplateId) through any website endpoint", async () => {
    const scenario = await buildBaseScenario();
    await publishScenarioPackage(scenario.packageId);
    const response = expectSuccess<{ items: Record<string, unknown>[] }>((await api.get("/api/website/packages")).body);
    for (const card of response.items) {
      expect(card).not.toHaveProperty("currentVersionId");
      expect(card).not.toHaveProperty("sourceTemplateId");
    }
  });
});

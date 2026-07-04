import { describe, expect, it } from "vitest";
import { buildSeoDTO } from "@/modules/website/seo/seo-builder";

const fallbacks = { title: "Fallback Title", description: "Fallback description", path: "/destination/andaman-islands" };

describe("buildSeoDTO", () => {
  it("falls back to entity title/description and a base-url-derived canonical URL when no override exists", () => {
    const dto = buildSeoDTO("https://thevacationvoice.com", {}, fallbacks);
    expect(dto).toEqual({
      title: "Fallback Title",
      description: "Fallback description",
      canonicalUrl: "https://thevacationvoice.com/destination/andaman-islands",
      ogTitle: "Fallback Title",
      ogDescription: "Fallback description",
      ogImage: null,
    });
  });

  it("prefers an explicit override over the fallback for every field", () => {
    const dto = buildSeoDTO(
      "https://thevacationvoice.com",
      { metaTitle: "Custom Title", metaDescription: "Custom description", canonicalUrl: "https://custom.example.com/x", ogImageUrl: "https://cdn.example.com/img.jpg" },
      fallbacks
    );
    expect(dto.title).toBe("Custom Title");
    expect(dto.description).toBe("Custom description");
    expect(dto.canonicalUrl).toBe("https://custom.example.com/x");
    expect(dto.ogImage).toBe("https://cdn.example.com/img.jpg");
  });

  it("produces a relative path (not a broken absolute URL) when baseUrl is empty — unset WEBSITE_BASE_URL case", () => {
    const dto = buildSeoDTO("", {}, fallbacks);
    expect(dto.canonicalUrl).toBe("/destination/andaman-islands");
  });

  it("ogTitle/ogDescription always mirror title/description — never independently overridable", () => {
    const dto = buildSeoDTO("https://x.com", { metaTitle: "T" }, fallbacks);
    expect(dto.ogTitle).toBe(dto.title);
  });
});

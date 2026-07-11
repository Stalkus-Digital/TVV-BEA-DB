import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderPackageCards(packages: any[]): string {
  if (!packages || packages.length === 0) {
    return `<p class="no-packages">No packages available. Please check back soon.</p>`;
  }

  return packages
    .map(
      (pkg: any) => `
    <div class="package-card">
      ${pkg.imageUrl ? `<div class="package-card__image" style="background-image: url('${escapeHtml(pkg.imageUrl)}')"></div>` : `<div class="package-card__image package-card__image--placeholder"></div>`}
      <div class="package-card__body">
        <h3 class="package-card__title">${escapeHtml(pkg.title || "Untitled Package")}</h3>
        <p class="package-card__meta">${escapeHtml(pkg.durationDays ? `${pkg.durationDays}D / ${pkg.durationNights ?? pkg.durationDays - 1}N` : "Duration TBD")}</p>
        ${pkg.description ? `<p class="package-card__desc">${escapeHtml(String(pkg.description).substring(0, 160))}...</p>` : ""}
        <div class="package-card__footer">
          ${pkg.basePrice ? `<span class="package-card__price">₹${Number(pkg.basePrice).toLocaleString("en-IN")}</span>` : ""}
          <a href="mailto:info@thevacationvoice.com?subject=Enquiry: ${encodeURIComponent(pkg.title || "Package")}" class="package-card__cta">Enquire Now</a>
        </div>
      </div>
    </div>`
    )
    .join("\n");
}

function renderFaqs(faqs: { question: string; answer: string }[]): string {
  if (!faqs || faqs.length === 0) return "";
  return `
  <section class="section faq-section">
    <div class="container">
      <h2 class="section__title">Frequently Asked Questions</h2>
      <div class="faq-list">
        ${faqs.map((f, i) => `
        <div class="faq-item">
          <button class="faq-item__q" onclick="var a=document.getElementById('faq-a-${i}');a.style.display=a.style.display==='none'?'block':'none'">
            ${escapeHtml(f.question)}
          </button>
          <div id="faq-a-${i}" class="faq-item__a" style="display:none">${escapeHtml(f.answer)}</div>
        </div>`).join("")}
      </div>
    </div>
  </section>`;
}

function renderWhyChooseUs(reasons: { title: string; description: string }[]): string {
  if (!reasons || reasons.length === 0) return "";
  return `
  <section class="section why-section">
    <div class="container">
      <h2 class="section__title">Why Choose Us</h2>
      <div class="why-grid">
        ${reasons.map(r => `
        <div class="why-card">
          <h3>${escapeHtml(r.title)}</h3>
          <p>${escapeHtml(r.description)}</p>
        </div>`).join("")}
      </div>
    </div>
  </section>`;
}

function generateHtml(page: any, packages: any[]): string {
  const hero = (page.heroSection as any) ?? {};
  const faqs = Array.isArray(page.faqs) ? page.faqs : [];
  const whyChooseUs = Array.isArray(page.whyChooseUs) ? page.whyChooseUs : [];
  const brandColor = page.brandColor ?? "#0f766e";
  const companyName = page.companyName ?? "The Vacation Voice";
  const contactEmail = page.contactEmail ?? "info@thevacationvoice.com";
  const contactPhone = page.contactPhone ?? "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(hero.description ?? page.title ?? "")}">
  <title>${escapeHtml(page.title ?? companyName)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; line-height: 1.6; }
    a { color: ${escapeHtml(brandColor)}; }

    /* HERO */
    .hero {
      min-height: 80vh;
      display: flex; align-items: center; justify-content: center;
      text-align: center;
      background: linear-gradient(135deg, ${escapeHtml(brandColor)}cc, #1a1a2ecc),
                  url('${escapeHtml(hero.backgroundImage ?? "")}') center/cover no-repeat;
      padding: 60px 20px;
      color: #fff;
    }
    .hero__inner { max-width: 720px; }
    .hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; margin-bottom: 1rem; line-height: 1.2; }
    .hero__sub { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
    .hero__cta {
      display: inline-block; padding: 16px 36px;
      background: #fff; color: ${escapeHtml(brandColor)};
      font-weight: 700; font-size: 1.1rem;
      border-radius: 50px; text-decoration: none;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      transition: transform .2s;
    }
    .hero__cta:hover { transform: translateY(-2px); }

    /* LAYOUT */
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .section { padding: 70px 0; }
    .section__title { font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 2.5rem; color: ${escapeHtml(brandColor)}; }

    /* PACKAGE CARDS */
    .packages-section { background: #f8fafc; }
    .packages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 28px; }
    .package-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: transform .2s, box-shadow .2s; }
    .package-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.14); }
    .package-card__image { height: 200px; background: linear-gradient(135deg, ${escapeHtml(brandColor)}44, #64748b44) center/cover no-repeat; }
    .package-card__image--placeholder { background: linear-gradient(135deg, ${escapeHtml(brandColor)}33 0%, #64748b33 100%); }
    .package-card__body { padding: 20px; }
    .package-card__title { font-size: 1.15rem; font-weight: 700; margin-bottom: 6px; color: #1e293b; }
    .package-card__meta { font-size: 0.85rem; color: #64748b; margin-bottom: 10px; }
    .package-card__desc { font-size: 0.9rem; color: #475569; margin-bottom: 14px; }
    .package-card__footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .package-card__price { font-size: 1.2rem; font-weight: 800; color: ${escapeHtml(brandColor)}; }
    .package-card__cta {
      padding: 10px 20px; background: ${escapeHtml(brandColor)};
      color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem;
      transition: opacity .2s;
    }
    .package-card__cta:hover { opacity: 0.88; color: #fff; }
    .no-packages { text-align: center; color: #64748b; padding: 40px; }

    /* WHY CHOOSE US */
    .why-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
    .why-card { background: #f8fafc; border-radius: 12px; padding: 24px; border-left: 4px solid ${escapeHtml(brandColor)}; }
    .why-card h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 8px; color: #1e293b; }
    .why-card p { font-size: 0.9rem; color: #475569; }

    /* FAQ */
    .faq-section { background: #f1f5f9; }
    .faq-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
    .faq-item { background: #fff; border-radius: 10px; overflow: hidden; }
    .faq-item__q { width: 100%; text-align: left; padding: 18px 20px; font-size: 1rem; font-weight: 600; cursor: pointer; background: none; border: none; color: #1e293b; }
    .faq-item__a { padding: 0 20px 18px; color: #475569; font-size: 0.95rem; }

    /* FOOTER */
    .footer { background: #1e293b; color: #94a3b8; padding: 40px 20px; text-align: center; }
    .footer a { color: ${escapeHtml(brandColor)}; }

    @media (max-width: 600px) {
      .hero h1 { font-size: 1.8rem; }
      .packages-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="hero">
    <div class="hero__inner">
      <h1>${escapeHtml(hero.headline ?? page.title ?? companyName)}</h1>
      ${hero.description ? `<p class="hero__sub">${escapeHtml(hero.description)}</p>` : ""}
      <a href="mailto:${escapeHtml(contactEmail)}" class="hero__cta">${escapeHtml(hero.ctaText ?? "Plan My Trip")}</a>
    </div>
  </header>

  <section class="section packages-section">
    <div class="container">
      <h2 class="section__title">Our Packages</h2>
      <div class="packages-grid">
        ${renderPackageCards(packages)}
      </div>
    </div>
  </section>

  ${renderWhyChooseUs(whyChooseUs)}

  ${renderFaqs(faqs)}

  <footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(companyName)}. All rights reserved.</p>
      ${contactEmail ? `<p>Contact: <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>${contactPhone ? ` | ${escapeHtml(contactPhone)}` : ""}</p>` : ""}
    </div>
  </footer>
</body>
</html>`;
}

function generatePhp(page: any, packages: any[]): string {
  const html = generateHtml(page, packages);
  const title = (page.title ?? "Landing Page").replace(/"/g, '\\"');
  return `<?php
// TVV Travel OS — Landing Page Export
// Generated: ${new Date().toISOString()}
// Page: ${title}
?>
${html}`;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const format = url.searchParams.get("format") ?? "html"; // html or php

    const page = await prisma.landingPage.findUnique({ where: { id } });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Fetch real packages linked to this landing page
    const packageIds: string[] = Array.isArray((page as any).packageIds)
      ? (page as any).packageIds
      : [];

    let packages: any[] = [];
    if (packageIds.length > 0) {
      packages = await prisma.package.findMany({
        where: { id: { in: packageIds }, status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          durationDays: true,
          durationNights: true,
          status: true,
        },
      });
    } else {
      // No explicit package list — use featured/published packages for this destination
      const destinationId = (page as any).destinationId;
      packages = await prisma.package.findMany({
        where: {
          status: "PUBLISHED",
          ...(destinationId ? { destinationId } : {}),
        },
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          durationDays: true,
          durationNights: true,
          status: true,
        },
      });
    }

    const content = format === "php" ? generatePhp(page, packages) : generateHtml(page, packages);
    const filename = `${(page as any).slug ?? id}-export.${format}`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": format === "php" ? "application/x-httpd-php" : "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to export page" }, { status: 500 });
  }
}

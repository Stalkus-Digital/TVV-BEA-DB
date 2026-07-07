import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";

function generateHtml(page: any) {
  const hero = page.heroSection || {};
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 0; }
    .hero { background: url('${hero.backgroundImage || ""}'); padding: 100px 20px; color: white; text-align: center; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>${hero.headline || page.title}</h1>
    <p>${hero.description || ""}</p>
  </div>
  <div class="container">
    <h2>Available Packages</h2>
    <!-- Packages JSON: ${JSON.stringify(page.packages)} -->
    <p>Render packages here.</p>
  </div>
</body>
</html>`;
}

function generatePhp(page: any) {
  const html = generateHtml(page);
  return `<?php
// TVV Landing Page Export
$pageTitle = "${page.title}";
?>
${html}`;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "html"; // html or php

    const page = await prisma.landingPage.findUnique({ where: { id } });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const content = format === "php" ? generatePhp(page) : generateHtml(page);
    const filename = `${page.slug}-export.${format}`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": format === "php" ? "application/x-httpd-php" : "text/html",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to export page" }, { status: 500 });
  }
}

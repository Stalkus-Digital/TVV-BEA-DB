import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ConciergeWidget } from "@/components/layout/ConciergeWidget";
import { JsonLd } from "@/components/ui/JsonLd";
import { organizationJsonLd, SITE, buildMetadata } from "@/lib/seo";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  themeColor: "#0A1628",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = buildMetadata({
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  path: "/",
  keywords: [
    "luxury travel India",
    "Andaman tour packages",
    "honeymoon Andaman",
    "Andaman ferry booking",
    "scuba diving Havelock",
    "curated travel agency",
    "premium travel specialist",
    "Maldives honeymoon",
    "Kerala backwaters tour",
    "Rajasthan luxury tour",
    "Japan curated itinerary",
  ],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("tvv-fonts", "font-sans", geist.variable)}>
      <body>
        <QueryProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <ConciergeWidget />
          <JsonLd data={organizationJsonLd()} />
        </QueryProvider>
      </body>
    </html>
  );
}

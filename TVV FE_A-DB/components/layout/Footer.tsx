import Link from "next/link";
import { Instagram, Facebook, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { SITE } from "@/lib/seo";

const columns = [
  {
    title: "Explore by region",
    links: [
      { label: "Andaman Islands", href: "/andaman" },
      { label: "South India", href: "/packages/domestic/south-india" },
      { label: "North India", href: "/packages/domestic/north-india" },
      { label: "Europe", href: "/destinations/europe" },
      { label: "Asia & Pacific", href: "/packages/international?region=asia-pacific" },
      { label: "Indian Ocean", href: "/packages/international?region=indian-ocean" },
      { label: "Middle East", href: "/destinations/dubai" },
    ],
  },
  {
    title: "By experience",
    links: [
      { label: "Honeymoon escapes", href: "/honeymoon" },
      { label: "Luxury journeys", href: "/luxury" },
      { label: "Scuba & diving", href: "/experiences/scuba-diving" },
      { label: "Family travel", href: "/experiences/family" },
      { label: "Cultural routes", href: "/experiences/cultural" },
      { label: "Wellness retreats", href: "/experiences/wellness" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About TVV", href: "/about" },
      { label: "The Andaman story", href: "/andaman#story" },
      { label: "Corporate & MICE", href: "/corporate" },
      { label: "Travel guides", href: "/guides" },
      { label: "Careers", href: "/about#careers" },
      { label: "Press & media", href: "/about#press" },
    ],
  },
  {
    title: "Travellers",
    links: [
      { label: "Plan my journey", href: "/contact" },
      { label: "Ferry booking", href: "/ferry" },
      { label: "FAQs", href: "/faq" },
      { label: "Visa & entry notes", href: "/guides?category=visa" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-navy text-white grain">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-8">
        <div className="grid gap-12 pb-16 pt-20 lg:grid-cols-[1.4fr,1fr,1fr,1fr,1fr]">
          {/* Brand column */}
          <div className="lg:max-w-sm">
            <Logo />
            <p className="mt-6 text-[14px] leading-relaxed text-white/65">
              Curated global journeys, designed by specialists, anchored in two decades of Andaman expertise.
              Editorial planning, vetted stays, 24/7 concierge.
            </p>
            <div className="mt-6 space-y-2.5 text-[13px] text-white/70">
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 hover:text-white">
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2.5 hover:text-white">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {SITE.email}
              </a>
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Port Blair · Bengaluru · Mumbai</span>
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: Instagram, label: "Instagram", href: "https://instagram.com/thevacationvoice" },
                { icon: Facebook, label: "Facebook", href: "https://facebook.com/thevacationvoice" },
                { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/thevacationvoice" },
                { icon: Youtube, label: "YouTube", href: "https://youtube.com/@thevacationvoice" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-teal hover:text-teal"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-label uppercase text-white/55">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13px] text-white/75 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-8 border-t border-white/10 py-10 lg:grid-cols-[1.4fr,1fr] lg:items-center">
          <div>
            <p className="font-display text-[20px] text-white">
              Letters from the road, twice a month.
            </p>
            <p className="mt-2 text-[13px] text-white/60 max-w-md">
              Destination inspiration, off-season fares, and quiet recommendations from our specialists. Never spam.
            </p>
          </div>
          <form className="flex flex-col gap-2 sm:flex-row" aria-label="Newsletter sign-up">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input
              id="footer-email"
              type="email"
              placeholder="you@example.com"
              className="h-12 flex-1 rounded-md border border-white/15 bg-white/5 px-4 text-[14px] text-white placeholder:text-white/40 outline-none transition focus:border-teal focus:bg-white/10"
              required
            />
            <button
              type="submit"
              className="h-12 rounded-md bg-teal px-6 text-[14px] font-medium text-white transition-colors hover:bg-teal-hover"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 py-6 text-[12px] text-white/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} The Vacation Voice. All journeys curated with care.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

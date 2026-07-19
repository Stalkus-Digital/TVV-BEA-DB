/**
 * Starter CmsPage content for site registry pages.
 * Used only when a page row does not exist yet.
 */

export interface StarterPageSeed {
  title: string;
  content: {
    body: string;
    excerpt?: string;
    heroEyebrow?: string;
    heroSubtitle?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  status: "DRAFT" | "PUBLISHED";
}

export const SITE_PAGE_SEEDS: Record<string, StarterPageSeed> = {
  contact: {
    title: "Plan my journey",
    status: "PUBLISHED",
    content: {
      heroEyebrow: "Plan my journey",
      heroSubtitle:
        "A short form, a specialist who reads it carefully, and a written proposal in your inbox within four working hours. No call-centre, no script, no obligation.",
      excerpt: "Talk to a TVV travel specialist about your next journey.",
      metaTitle: "Plan My Journey — Talk to a TVV Specialist",
      metaDescription:
        "Talk to a TVV travel specialist. Share your dates, your destination, and how you like to travel — we'll send a private proposal within four working hours.",
      body: `<p>Tell us how you travel. We'll do the rest, quietly.</p>
<ol>
<li>A specialist reads your enquiry (a human, in India).</li>
<li>You'll receive a written proposal within four working hours.</li>
<li>We iterate — no pressure, no obligation.</li>
<li>Once you approve, a 25% deposit confirms your trip.</li>
</ol>`,
    },
  },
  faq: {
    title: "Frequently asked questions",
    status: "PUBLISHED",
    content: {
      heroEyebrow: "FAQs",
      heroSubtitle: "Answers to the questions travellers ask us most often.",
      excerpt: "Common questions about booking with The Vacation Voice.",
      metaTitle: "FAQs — The Vacation Voice",
      metaDescription: "Frequently asked questions about TVV journeys, bookings, and travel.",
      body: `<p>Browse the questions below. If you need something more specific, talk to a specialist — we'll reply within four working hours.</p>`,
    },
  },
  "visa-entry-notes": {
    title: "Visa & entry notes",
    status: "PUBLISHED",
    content: {
      heroEyebrow: "Before you travel",
      heroSubtitle: "High-level visa and entry guidance. Always verify with the relevant authority before you fly.",
      excerpt: "Visa and entry notes for TVV destinations.",
      metaTitle: "Visa & Entry Notes — The Vacation Voice",
      metaDescription: "Visa and entry guidance for travellers booking with The Vacation Voice.",
      body: `<p>Requirements change. Use this page as a starting point, then confirm with your embassy or a visa specialist before travel.</p>
<h2>India (including Andaman)</h2>
<p>Most foreign nationals need a valid visa or e-Visa. Indian citizens need a valid ID for domestic flights and ferry travel to the Andaman Islands.</p>
<h2>International journeys</h2>
<p>Your proposal will list passport validity, visa type, and any vaccination notes for your itinerary. We advise — you remain responsible for documents and entry.</p>`,
    },
  },
  privacy: {
    title: "Privacy Policy",
    status: "PUBLISHED",
    content: {
      heroSubtitle: "Last updated: May 2026",
      excerpt: "How TVV collects, uses and protects your personal information.",
      metaTitle: "Privacy Policy",
      metaDescription: "How TVV collects, uses and protects your personal information.",
      body: `<p>The Vacation Voice ("TVV", "we", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use and safeguard your personal information when you interact with our website, communicate with our specialists, or book a journey with us.</p>
<h2>1. Information we collect</h2>
<p>When you submit an enquiry, we collect your name, contact details, travel preferences and party composition. When you confirm a booking, we additionally collect identity documents required for transport, accommodation and visa formalities.</p>
<h2>2. How we use your information</h2>
<ul>
<li>To prepare a personalised travel proposal and respond to your enquiry.</li>
<li>To make reservations on your behalf with our hotel, airline, transport and experience partners.</li>
<li>To stay in touch through your journey via WhatsApp, email or phone.</li>
<li>To send occasional editorial communications (only if you've opted in).</li>
<li>To comply with legal, accounting and tax obligations.</li>
</ul>
<h2>3. Sharing with partners</h2>
<p>We share only the information necessary to confirm your booking with the relevant partners. Our partners are contractually obliged to protect your information and use it solely for the purposes of your trip.</p>
<h2>4. Data retention</h2>
<p>We retain enquiry data for up to 36 months, and booking data for up to 8 years as required by applicable tax and consumer-protection regulations.</p>
<h2>5. Cookies</h2>
<p>Our website uses essential cookies for functionality and anonymous analytics cookies. We do not use third-party advertising cookies.</p>
<h2>6. Your rights</h2>
<p>You have the right to access, correct, and delete your personal information held by us. Contact hello@thevacationvoice.com to exercise these rights.</p>`,
    },
  },
  terms: {
    title: "Terms of Service",
    status: "PUBLISHED",
    content: {
      heroSubtitle: "Last updated: May 2026",
      excerpt: "Terms governing your use of TVV services and your bookings with us.",
      metaTitle: "Terms of Service",
      metaDescription: "Terms governing your use of TVV services and your bookings with us.",
      body: `<p>These terms govern your use of The Vacation Voice website and your bookings with us. By submitting an enquiry or confirming a booking, you agree to these terms.</p>
<h2>1. Booking &amp; deposits</h2>
<p>Your booking is confirmed once a 25% deposit (or such other amount communicated to you in writing) is received. The balance is due no later than 30 days before departure for domestic journeys, and 60 days before departure for international journeys, unless otherwise agreed.</p>
<h2>2. Cancellation by traveller</h2>
<p>Cancellation charges are communicated in your proposal and depend on the partners involved. In general: 60+ days — deposit refundable less admin charges; 30–60 days — 50% forfeited; less than 30 days — 100% forfeited.</p>
<h2>3. Cancellation by TVV</h2>
<p>If we cancel due to force majeure or partner inability to deliver, we refund amounts paid in full or offer a re-booking at no additional cost.</p>
<h2>4. Travel documents &amp; insurance</h2>
<p>You are responsible for valid passports, visas, vaccinations and travel insurance. We provide advice but are not liable for denial of entry.</p>
<h2>5. Limitation of liability</h2>
<p>TVV acts as a curator and intermediary. Our liability is limited to the amount paid for the affected service.</p>
<h2>6. Governing law</h2>
<p>These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts of Bengaluru.</p>`,
    },
  },
  "andaman-story": {
    title: "The Andaman story",
    status: "PUBLISHED",
    content: {
      heroEyebrow: "Andaman · TVV signature",
      heroSubtitle: "Two decades of island expertise, quietly curated.",
      excerpt: "How The Vacation Voice became anchored in the Andaman Islands.",
      metaTitle: "The Andaman Story — The Vacation Voice",
      metaDescription: "The Andaman story behind The Vacation Voice — curated island journeys with local depth.",
      body: `<p>The Vacation Voice grew from years of planning Andaman journeys — ferries, cottages, diving, and the quieter islands most itineraries skip.</p>
<p>Today that Andaman expertise anchors every destination we curate: editorial planning, vetted stays, and specialists who answer when plans change.</p>`,
    },
  },
  corporate: {
    title: "Corporate & MICE",
    status: "PUBLISHED",
    content: {
      heroEyebrow: "TVV Corporate · MICE",
      heroSubtitle:
        "Offsites, incentive trips, conferences, dealer meets. One specialist, one timeline, in-house ground teams.",
      excerpt: "Corporate and MICE travel for groups of 12 to 600.",
      metaTitle: "Corporate & MICE Travel — Offsites, Incentives, Conferences",
      metaDescription:
        "TVV Corporate designs incentive trips, offsites, conferences and team events for groups of 12 to 600.",
      body: `<p>Corporate travel that runs the way your business does.</p>
<h2>What we design</h2>
<ul>
<li><strong>Offsites</strong> — Annual offsites, leadership retreats, team kick-offs.</li>
<li><strong>Incentive travel</strong> — Reward trips for sales teams, dealers, channel partners.</li>
<li><strong>Conferences</strong> — Closed-room conferences with delegate concierge and IT support.</li>
<li><strong>Team events</strong> — Day events, weekend programmes, family days.</li>
</ul>
<p>Request a proposal: <a href="mailto:corporate@thevacationvoice.com">corporate@thevacationvoice.com</a> or <a href="/contact?type=corporate">Plan my journey</a>.</p>`,
    },
  },
  careers: {
    title: "Careers",
    status: "PUBLISHED",
    content: {
      heroEyebrow: "Careers",
      heroSubtitle: "Join a team that plans journeys with care.",
      excerpt: "Open roles and how to apply at The Vacation Voice.",
      metaTitle: "Careers — The Vacation Voice",
      metaDescription: "Careers at The Vacation Voice — travel specialists, operations, and editorial roles.",
      body: `<p>We hire people who care about detail, hospitality, and destinations — not scripts.</p>
<p>If you'd like to work with us, send a short note and your CV to <a href="mailto:hello@thevacationvoice.com">hello@thevacationvoice.com</a> with the subject line “Careers”.</p>`,
    },
  },
  "press-media": {
    title: "Press & media",
    status: "PUBLISHED",
    content: {
      heroEyebrow: "Press",
      heroSubtitle: "Media enquiries, brand assets, and interview requests.",
      excerpt: "Press and media contacts for The Vacation Voice.",
      metaTitle: "Press & Media — The Vacation Voice",
      metaDescription: "Press and media enquiries for The Vacation Voice.",
      body: `<p>For press, partnerships, and interview requests, write to <a href="mailto:hello@thevacationvoice.com">hello@thevacationvoice.com</a> with “Press” in the subject line.</p>
<p>We can share brand guidelines, destination photography credits, and specialist interviews on request.</p>`,
    },
  },
};

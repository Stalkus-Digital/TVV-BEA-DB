import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Section } from "@/components/ui/Section";
import { buildMetadata, SITE } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How TVV collects, uses and protects your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-cream pt-10 pb-10">
        <Container size="default">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy" }]} />
          <h1 className="mt-8 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight tracking-tight text-ink">
            Privacy Policy
          </h1>
          <p className="mt-3 text-[12px] text-ink-muted">Last updated: May 2026</p>
        </Container>
      </section>

      <Section tone="cream" pad="default">
        <Container size="narrow">
          <div className="space-y-6 text-[15px] leading-[1.8] text-ink-secondary">
            <p>
              The Vacation Voice ("TVV", "we", "our") is committed to protecting your privacy. This Privacy
              Policy explains how we collect, use and safeguard your personal information when you interact with
              our website, communicate with our specialists, or book a journey with us.
            </p>

            <Heading>1. Information we collect</Heading>
            <p>
              When you submit an enquiry, we collect your name, contact details, travel preferences and party
              composition. When you confirm a booking, we additionally collect identity documents required for
              transport, accommodation and visa formalities.
            </p>

            <Heading>2. How we use your information</Heading>
            <ul className="list-disc space-y-2 pl-6">
              <li>To prepare a personalised travel proposal and respond to your enquiry.</li>
              <li>To make reservations on your behalf with our hotel, airline, transport and experience partners.</li>
              <li>To stay in touch through your journey via WhatsApp, email or phone.</li>
              <li>To send occasional editorial communications (only if you've opted in).</li>
              <li>To comply with legal, accounting and tax obligations.</li>
            </ul>

            <Heading>3. Sharing with partners</Heading>
            <p>
              We share only the information necessary to confirm your booking with the relevant partners
              (hotels, transport operators, ground handlers). Our partners are contractually obliged to protect
              your information and use it solely for the purposes of your trip.
            </p>

            <Heading>4. Data retention</Heading>
            <p>
              We retain enquiry data for up to 36 months, and booking data for up to 8 years as required by
              applicable tax and consumer-protection regulations. You may request deletion of your enquiry data
              at any time by writing to {SITE.email}.
            </p>

            <Heading>5. Cookies</Heading>
            <p>
              Our website uses essential cookies for functionality and anonymous analytics cookies to understand
              how the site is used. We do not use third-party advertising cookies.
            </p>

            <Heading>6. Your rights</Heading>
            <p>
              You have the right to access, correct, and delete your personal information held by us. To
              exercise any of these rights, please write to {SITE.email}.
            </p>

            <Heading>7. Contact</Heading>
            <p>
              For any questions about this Privacy Policy, please write to{" "}
              <a className="text-teal underline-offset-4 hover:underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="!mt-12 font-display text-[22px] leading-tight text-ink">{children}</h2>;
}

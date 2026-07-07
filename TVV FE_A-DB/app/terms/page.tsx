import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Section } from "@/components/ui/Section";
import { buildMetadata, SITE } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: "Terms governing your use of TVV services and your bookings with us.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <section className="bg-cream pt-10 pb-10">
        <Container size="default">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Terms" }]} />
          <h1 className="mt-8 font-display text-[clamp(2rem,4vw,2.75rem)] leading-tight tracking-tight text-ink">
            Terms of Service
          </h1>
          <p className="mt-3 text-[12px] text-ink-muted">Last updated: May 2026</p>
        </Container>
      </section>

      <Section tone="cream" pad="default">
        <Container size="narrow">
          <div className="space-y-6 text-[15px] leading-[1.8] text-ink-secondary">
            <p>
              These terms govern your use of The Vacation Voice ({SITE.name}, "we", "us") website and your
              bookings with us. By submitting an enquiry or confirming a booking, you agree to these terms.
            </p>

            <Heading>1. Booking & deposits</Heading>
            <p>
              Your booking is confirmed once a 25% deposit (or such other amount communicated to you in writing)
              is received. The balance is due no later than 30 days before departure for domestic journeys, and
              60 days before departure for international journeys, unless otherwise agreed.
            </p>

            <Heading>2. Cancellation by traveller</Heading>
            <p>
              Cancellation charges are communicated transparently in your proposal and depend on the partners
              involved (hotel, airline, ground operator). In general:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>60+ days before departure: deposit refundable less administrative charges.</li>
              <li>30–60 days: 50% of trip cost forfeited.</li>
              <li>Less than 30 days: 100% of trip cost forfeited.</li>
            </ul>
            <p>
              We strongly recommend travel insurance, which we can arrange.
            </p>

            <Heading>3. Cancellation by TVV</Heading>
            <p>
              In the rare event we need to cancel a journey (due to force majeure or partner inability to
              deliver), we will refund all amounts paid in full or offer a re-booking at no additional cost.
            </p>

            <Heading>4. Travel documents & insurance</Heading>
            <p>
              You are responsible for ensuring you have valid passports, visas, vaccinations and travel
              insurance. We provide advice on visa and entry requirements but are not liable for any denial of
              entry.
            </p>

            <Heading>5. Limitation of liability</Heading>
            <p>
              TVV acts as a curator and intermediary with travel service partners. Our liability is limited to
              the amount paid for the affected service. We are not liable for indirect, consequential, or
              special damages.
            </p>

            <Heading>6. Governing law</Heading>
            <p>
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive
              jurisdiction of the courts of Bengaluru.
            </p>

            <Heading>7. Contact</Heading>
            <p>
              Questions? Write to{" "}
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

"use client";

import { Container } from "@/components/ui/Container";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function PackagesError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="bg-cream py-section">
      <Container size="default">
        <p className="text-label uppercase text-danger">Inventory couldn't load</p>
        <h1 className="mt-3 font-display text-[28px] leading-tight text-ink">
          Our package shelf is briefly unavailable.
        </h1>
        <p className="mt-3 max-w-xl text-[14px] text-ink-secondary">
          The catalog hit a transient error. Usually fixed within a minute. You can retry, or write to a
          specialist who can hand-build a journey from scratch.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={reset}>Retry</Button>
          <ButtonLink href="/contact" variant="outline">Talk to a specialist</ButtonLink>
        </div>
      </Container>
    </section>
  );
}

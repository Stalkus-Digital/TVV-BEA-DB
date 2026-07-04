"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { ButtonLink, Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error("[TVV] page error:", error);
    }
  }, [error]);

  return (
    <section className="bg-cream py-section">
      <Container size="default">
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-[14px] text-danger">Something went sideways</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] leading-tight tracking-tight text-ink">
            We hit a snag on the road.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
            The page failed to load cleanly. This is on us — usually a slow upstream supplier or a routing hiccup.
            Try again, or reach a specialist directly.
          </p>
          {error.digest && (
            <p className="mt-4 text-[11px] font-mono text-ink-muted">Ref: {error.digest}</p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={reset} size="lg">Try again</Button>
            <ButtonLink href="/contact" variant="outline" size="lg">Talk to a specialist</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

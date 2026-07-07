import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="bg-cream py-section">
      <Container size="default">
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-[14px] text-teal">404</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] leading-tight tracking-tight text-ink">
            A route we haven't mapped yet.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
            The page you're looking for has moved, or perhaps never existed. Try the homepage, or
            ask a specialist — we may have a journey that fits what you had in mind.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/" size="lg">Return home</ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg">Talk to a specialist</ButtonLink>
          </div>
          <p className="mt-10 text-[12px] text-ink-muted">
            Or browse{" "}
            <Link href="/andaman" className="text-teal hover:underline">Andaman</Link>,{" "}
            <Link href="/packages/domestic" className="text-teal hover:underline">domestic packages</Link>, or{" "}
            <Link href="/packages/international" className="text-teal hover:underline">international packages</Link>.
          </p>
        </div>
      </Container>
    </section>
  );
}

import { Container } from "@/components/ui/Container";

export default function Loading() {
  return (
    <div className="bg-cream pt-6 pb-section" aria-busy>
      <Container>
        <div className="grid gap-3 sm:grid-cols-[1.6fr,1fr]">
          <div className="aspect-[16/10] animate-pulse rounded-xl bg-surface" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.7fr,1fr]">
          <div className="space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-surface" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-surface" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface" />
          </div>
          <div className="h-[400px] animate-pulse rounded-xl bg-surface" />
        </div>
      </Container>
    </div>
  );
}

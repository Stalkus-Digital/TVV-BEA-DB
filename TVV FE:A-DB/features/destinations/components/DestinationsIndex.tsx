import Link from "next/link";
import Image from "next/image";
import { getDestinationTree } from "@/lib/hierarchy";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { destinationSlugPathHref } from "../paths";

export async function DestinationsIndex() {
  const tree = await getDestinationTree();

  return (
    <main className="bg-cream pt-32 pb-section">
      <Container size="wide">
        <p className="text-label uppercase text-teal">Destinations</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-tight text-ink">
          Curated places, specialist knowledge.
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-secondary">
          Browse regions and countries in our geographical tree — each landing page is built for planning, not scrolling.
        </p>

        {tree.length === 0 ? (
          <p className="mt-12 text-[15px] text-ink-muted">
            Our destination tree is being populated. Explore{" "}
            <Link href="/packages/domestic" className="text-teal hover:underline">
              domestic packages
            </Link>{" "}
            in the meantime.
          </p>
        ) : (
          <div className="mt-14 space-y-12">
            {tree.map((region) => (
              <section key={region.id}>
                <h2 className="font-display text-[28px] text-ink">{region.name}</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {region.children.map((node) => (
                    <Link
                      key={node.id}
                      href={destinationSlugPathHref(node.slugPath)}
                      className="group overflow-hidden rounded-xl border border-line bg-white shadow-card transition hover:-translate-y-1 hover:shadow-hover"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                        {node.imageUrl ? (
                          <Image
                            src={node.imageUrl}
                            alt={node.name}
                            fill
                            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 90vw"
                            className="object-cover transition duration-700 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-display text-ink-muted">
                            {node.name}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-teal">{node.level.toLowerCase()}</p>
                        <p className="mt-1 font-display text-[18px] text-ink">{node.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>

      <Section tone="white" pad="default">
        <Container size="wide">
          <h2 className="font-display text-[24px] text-ink">Editorial guides</h2>
          <p className="mt-2 text-[15px] text-ink-secondary">
            Long-form planning notes from our specialists.{" "}
            <Link href="/guides" className="text-teal hover:underline">
              Browse all guides
            </Link>
          </p>
        </Container>
      </Section>
    </main>
  );
}

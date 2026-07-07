interface EditorialBodySectionProps {
  html: string;
}

export function EditorialBodySection({ html }: EditorialBodySectionProps) {
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-0">
        <div
          className="prose-tvv text-[18px] leading-[1.9] text-ink-secondary"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}

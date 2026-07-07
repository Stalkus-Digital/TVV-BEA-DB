import { Check, X } from "lucide-react";

interface PackageInclusionsProps {
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy?: string;
}

export function PackageInclusions({ inclusions, exclusions, cancellationPolicy }: PackageInclusionsProps) {
  return (
    <section>
      <h2 className="font-display text-[32px] text-ink">What&apos;s included</h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-success">Included</p>
          <ul className="mt-5 space-y-4">
            {inclusions.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-secondary">
                <Check className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-danger/70">Not included</p>
          <ul className="mt-5 space-y-4">
            {exclusions.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-secondary">
                <X className="mt-1 h-4 w-4 shrink-0 text-danger/60" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {cancellationPolicy && (
        <p className="mt-10 rounded-lg border border-line/40 bg-white/50 p-6 text-[13px] leading-relaxed text-ink-secondary">
          <span className="font-bold text-ink">Cancellation Policy:</span> {cancellationPolicy}
        </p>
      )}
    </section>
  );
}

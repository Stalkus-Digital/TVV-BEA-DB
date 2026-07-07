import Link from "next/link";
import { formatINR } from "@/lib/utils";

interface PackageMobileCtaProps {
  slug: string;
  pricePerAdult: number;
}

export function PackageMobileCta({ slug, pricePerAdult }: PackageMobileCtaProps) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
      <div className="flex items-center justify-between gap-4 rounded-full border border-white/20 bg-white/90 p-2 pl-6 shadow-modal backdrop-blur-xl">
        <div>
          <p className="font-mono text-[20px] font-bold leading-none text-teal">{formatINR(pricePerAdult)}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">per adult</p>
        </div>
        <Link
          href={`/contact?tour=${slug}`}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-teal px-6 text-[13px] font-bold uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-teal-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          Get Proposal
        </Link>
      </div>
    </div>
  );
}

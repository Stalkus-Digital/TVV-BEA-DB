import Link from "next/link";
import type { BreadcrumbItem } from "../types";

interface DestinationBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function DestinationBreadcrumb({ items }: DestinationBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-white/70">
      {items.map((item, index) => (
        <span key={`${item.href}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 && <span className="text-white/30" aria-hidden>/</span>}
          {index < items.length - 1 ? (
            <Link href={item.href} className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal">
              {item.label}
            </Link>
          ) : (
            <span className="text-white" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

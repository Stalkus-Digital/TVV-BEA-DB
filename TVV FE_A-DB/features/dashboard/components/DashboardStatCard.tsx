import Link from "next/link";

interface DashboardStatCardProps {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  value?: number | string;
}

export function DashboardStatCard({ eyebrow, title, description, href, value }: DashboardStatCardProps) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-line bg-white p-6 transition hover:border-teal hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-teal">{eyebrow}</p>
        {value !== undefined && (
          <span className="font-mono text-[20px] font-medium text-ink">{value}</span>
        )}
      </div>
      <p className="mt-2 font-display text-[20px] text-ink">{title}</p>
      <p className="mt-1.5 text-[13px] text-ink-secondary">{description}</p>
    </Link>
  );
}

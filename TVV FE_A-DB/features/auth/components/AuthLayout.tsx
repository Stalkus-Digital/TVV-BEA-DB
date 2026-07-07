import { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-cream pt-32 pb-section">
      <div className="mx-auto w-full max-w-md px-6">
        <h1 className="font-display text-[clamp(2rem,4vw,2.5rem)] leading-tight tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">{subtitle}</p>
        )}

        <div className="mt-8 rounded-2xl border border-line bg-white p-8 shadow-card">
          {children}
        </div>

        {footer && (
          <p className="mt-6 text-center text-[14px] text-ink-secondary">{footer}</p>
        )}
      </div>
    </main>
  );
}

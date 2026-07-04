"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, error, id, className, ...props },
  ref,
) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="block">
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.1em] text-ink-secondary">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          "block min-h-11 w-full rounded-md border border-line bg-white px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-muted",
          "focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-teal-light",
          error && "border-danger",
          className,
        )}
        {...props}
      />
      {error && (
        <span id={errorId} role="alert" className="mt-1 block text-[12px] text-danger">
          {error}
        </span>
      )}
    </div>
  );
});

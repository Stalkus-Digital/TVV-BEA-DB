"use client";

import { useMemo, useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import type { QuoteRequestInput } from "@/features/quotes";
import { useSubmitQuoteMutation } from "@/features/quotes";

const destinations = [
  "Andaman Islands",
  "Kerala",
  "Rajasthan",
  "Ladakh",
  "Himachal",
  "Kashmir",
  "Goa",
  "Sikkim",
  "Maldives",
  "Bali",
  "Japan",
  "Europe",
  "Switzerland",
  "Dubai",
  "Thailand",
  "Vietnam",
  "Other / not sure",
];

const tripTypes = ["Honeymoon", "Family", "Adventure", "Luxury", "Wellness", "Cultural", "Corporate / MICE", "Other"];

const budgets = [
  "Under ₹50k / person",
  "₹50k – 1L / person",
  "₹1L – 2L / person",
  "₹2L – 4L / person",
  "₹4L+ / person",
  "Open / flexible",
];

const durations = ["3–4 days", "5–6 days", "7–10 days", "11–14 days", "15+ days", "Not sure"];

export function EnquiryForm() {
  const submitQuote = useSubmitQuoteMutation();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    fromCity: "",
    destination: destinations[0] ?? "Other / not sure",
    tripType: tripTypes[0] ?? "Other",
    travelDates: "",
    duration: durations[0] ?? "Not sure",
    partySize: "",
    budget: budgets[0] ?? "Open / flexible",
    message: "",
    marketingOk: true,
  });

  const guests = useMemo(() => {
    const matches = form.partySize.match(/\d+/g);
    if (!matches || matches.length === 0) return undefined;
    const nums = matches
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (nums.length === 0) return undefined;
    const total = nums.reduce((a, b) => a + b, 0);
    return total > 0 ? total : undefined;
  }, [form.partySize]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state !== "idle") return;
    setError(null);
    setState("sending");

    const parts: string[] = [];
    if (form.fromCity.trim()) parts.push(`Travelling from: ${form.fromCity.trim()}`);
    if (form.duration.trim()) parts.push(`Duration: ${form.duration.trim()}`);
    if (form.partySize.trim()) parts.push(`Party size: ${form.partySize.trim()}`);
    if (form.marketingOk) parts.push("Marketing opt-in: yes");
    else parts.push("Marketing opt-in: no");

    const message = [form.message.trim(), parts.filter(Boolean).join("\n")].filter(Boolean).join("\n\n");

    const payload: QuoteRequestInput = {
      name: form.name.trim(),
      email: form.email.trim(),
      message,
      phone: form.phone.trim() || undefined,
      destination: form.destination.trim() || undefined,
      tripType: form.tripType.trim() || undefined,
      travelDates: form.travelDates.trim() || undefined,
      guests,
      budget: form.budget.trim() || undefined,
      source: "tvv-new2-website:/contact",
    };

    try {
      await submitQuote.mutateAsync(payload);
    } catch (err) {
      setState("idle");
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
      return;
    }

    setState("sent");
    setForm({
      name: "",
      email: "",
      phone: "",
      fromCity: "",
      destination: destinations[0] ?? "Other / not sure",
      tripType: tripTypes[0] ?? "Other",
      travelDates: "",
      duration: durations[0] ?? "Not sure",
      partySize: "",
      budget: budgets[0] ?? "Open / flexible",
      message: "",
      marketingOk: true,
    });
  }

  if (state === "sent") {
    return (
      <div className="rounded-xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold drop-shadow-md" aria-hidden />
        <h2 className="mt-4 font-display text-[24px] text-white drop-shadow-md">Your enquiry is with a specialist.</h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/80 drop-shadow-sm">
          You'll hear from us within four working hours — by email and WhatsApp, in case one is easier to read.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-white/20 bg-white/10 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:p-9"
      aria-label="Enquiry form"
    >
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-100"
        >
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required>
          <input
            type="text"
            required
            placeholder="As you'd like us to address you"
            className="input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="Email address" required>
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="input"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="WhatsApp / phone">
          <input
            type="tel"
            placeholder="+91 9123 456 789"
            className="input"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
        <Field label="Travelling from">
          <input
            type="text"
            placeholder="City of departure"
            className="input"
            value={form.fromCity}
            onChange={(e) => update("fromCity", e.target.value)}
          />
        </Field>
        <Field label="Destination">
          <select className="input" value={form.destination} onChange={(e) => update("destination", e.target.value)}>
            {destinations.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Trip type">
          <select className="input" value={form.tripType} onChange={(e) => update("tripType", e.target.value)}>
            {tripTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Approximate dates">
          <input
            type="text"
            placeholder="e.g. mid-November, flexible"
            className="input"
            value={form.travelDates}
            onChange={(e) => update("travelDates", e.target.value)}
          />
        </Field>
        <Field label="Duration">
          <select className="input" value={form.duration} onChange={(e) => update("duration", e.target.value)}>
            {durations.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Party size">
          <input
            type="text"
            placeholder="2 adults, 1 child (8 yrs)"
            className="input"
            value={form.partySize}
            onChange={(e) => update("partySize", e.target.value)}
          />
        </Field>
        <Field label="Budget per person">
          <select className="input" value={form.budget} onChange={(e) => update("budget", e.target.value)}>
            {budgets.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5">
        <Field label="A little about how you like to travel" required>
          <textarea
            rows={4}
            required
            placeholder="Pace, properties you've loved, things to include or avoid…"
            className="input min-h-[120px] py-3 resize-y"
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
          />
        </Field>
      </div>

      <label className="mt-5 flex items-start gap-3 text-[12px] text-white/80">
        <input
          type="checkbox"
          checked={form.marketingOk}
          onChange={(e) => update("marketingOk", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-teal focus:ring-teal focus:ring-offset-0"
        />
        <span>I'd like to receive occasional travel inspiration and off-season fares. Never spam.</span>
      </label>

      <div className="mt-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-[12px] text-white/60">
          A specialist replies within four working hours. No charge until you approve a proposal.
        </p>
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal px-7 text-[14px] font-medium text-white transition-colors hover:bg-teal-hover disabled:opacity-70"
        >
          {state === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            <>
              Send enquiry <Send className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
        }
        :global(.input::placeholder) {
          color: rgba(255, 255, 255, 0.4);
        }
        :global(.input option) {
          background: var(--tvv-navy);
          color: white;
        }
        :global(.input:focus) {
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }
        :global(textarea.input) {
          height: auto;
          padding: 12px 14px;
        }
      `}</style>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-label uppercase text-white/70">
        {label}
        {required && <span className="ml-1 text-gold">*</span>}
      </span>
      {children}
    </label>
  );
}

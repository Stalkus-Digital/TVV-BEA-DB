"use client";

import { ArrowDown } from "lucide-react";
import type {
  CustomerBookingRecord,
  CustomerEnquiryRecord,
  CustomerQuoteRecord,
} from "../types";
import { formatCustomerDate } from "../utils";

interface CustomerFunnelViewProps {
  enquiries: CustomerEnquiryRecord[];
  quotes: CustomerQuoteRecord[];
  bookings: CustomerBookingRecord[];
}

export function CustomerFunnelView({ enquiries, quotes, bookings }: CustomerFunnelViewProps) {
  const stages = [
    {
      key: "enquiries",
      label: "Enquiries",
      count: enquiries.length,
      items: [...enquiries]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
      renderItem: (item: CustomerEnquiryRecord) => ({
        title: item.name,
        meta: `${item.type} · ${item.status}`,
        date: item.createdAt,
      }),
    },
    {
      key: "quotes",
      label: "Quotes",
      count: quotes.length,
      items: [...quotes]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
      renderItem: (item: CustomerQuoteRecord) => ({
        title: item.title,
        meta: `${item.quoteNumber} · ${item.status}`,
        date: item.createdAt,
      }),
    },
    {
      key: "bookings",
      label: "Bookings",
      count: bookings.length,
      items: [...bookings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
      renderItem: (item: CustomerBookingRecord) => ({
        title: item.bookingNumber,
        meta: `${item.status} · ${item.currency} ${item.totalAmount.toLocaleString("en-IN")}`,
        date: item.createdAt,
      }),
    },
  ] as const;

  return (
    <section className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Sales funnel</h4>
        <p className="text-xs text-muted-foreground mt-1">
          Enquiries → Quotes → Bookings for this customer account.
        </p>
      </div>

      <div className="space-y-2">
        {stages.map((stage, index) => (
          <div key={stage.key}>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{stage.label}</span>
                <span className="text-xs font-medium rounded-full bg-primary/10 text-primary px-2 py-0.5">
                  {stage.count}
                </span>
              </div>

              {stage.items.length === 0 ? (
                <p className="text-xs text-muted-foreground mt-2">No {stage.label.toLowerCase()} linked yet.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {stage.items.map((item) => {
                    const rendered = stage.renderItem(item as never);
                    return (
                      <li key={item.id} className="rounded-md border border-border bg-card px-3 py-2 text-sm">
                        <div className="font-medium">{rendered.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{rendered.meta}</div>
                        <div className="text-xs text-muted-foreground mt-1">{formatCustomerDate(rendered.date)}</div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {index < stages.length - 1 && (
              <div className="flex justify-center py-1 text-muted-foreground">
                <ArrowDown className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

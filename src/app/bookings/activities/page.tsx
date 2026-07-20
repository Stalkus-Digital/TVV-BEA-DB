"use client";

import { BookingsPage } from "@/features/admin-bookings/components/BookingsPage";

export default function ActivityBookingsPage() {
  return (
    <BookingsPage
      title="Activity Bookings"
      description="Track and manage activity bookings created from quotes or the website."
      lockedProductTab="ACTIVITY"
    />
  );
}

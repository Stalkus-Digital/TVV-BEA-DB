"use client";

import { BookingsPage } from "@/features/admin-bookings/components/BookingsPage";

export default function HolidayBookingsPage() {
  return (
    <BookingsPage
      title="Holiday Bookings"
      description="Track and manage holiday package bookings created from quotes or the website."
      lockedProductTab="PACKAGE"
    />
  );
}

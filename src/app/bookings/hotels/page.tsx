"use client";

import { BookingsPage } from "@/features/admin-bookings/components/BookingsPage";

export default function HotelBookingsPage() {
  return (
    <BookingsPage
      title="Hotel Bookings"
      description="Track and manage hotel reservations created from quotes or the website."
      lockedProductTab="HOTEL"
    />
  );
}

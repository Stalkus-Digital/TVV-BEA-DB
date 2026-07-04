import { BookingsTable } from "@/components/bookings/BookingsTable";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all customer bookings and payments.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors">
          Create Booking
        </button>
      </div>
      <BookingsTable />
    </div>
  );
}

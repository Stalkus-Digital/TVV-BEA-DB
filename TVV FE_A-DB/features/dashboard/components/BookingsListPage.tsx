import { DashboardShell } from "./DashboardShell";
import { BookingsListView } from "@/features/bookings";

export function BookingsListPage() {
  return (
    <DashboardShell>
      <BookingsListView />
    </DashboardShell>
  );
}

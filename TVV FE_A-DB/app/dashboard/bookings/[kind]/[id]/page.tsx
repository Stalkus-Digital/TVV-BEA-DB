import { notFound } from "next/navigation";
import { BookingDetailView, isBookingKind } from "@/features/bookings";
import { DashboardShell } from "@/features/dashboard";

export default async function BookingDetailRoute({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (!isBookingKind(kind)) notFound();

  return (
    <DashboardShell>
      <BookingDetailView kind={kind} id={id} />
    </DashboardShell>
  );
}

import { DashboardShell } from "./DashboardShell";
import { QuotesListView } from "@/features/quotes";

export function QuotesListPage() {
  return (
    <DashboardShell>
      <QuotesListView />
    </DashboardShell>
  );
}

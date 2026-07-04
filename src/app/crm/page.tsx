import { CrmBoard } from "@/components/crm/CrmBoard";

export default function CrmPage() {
  return (
    <div className="h-[calc(100vh-6rem)] -m-6 flex flex-col">
      <div className="p-6 border-b border-border bg-card shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">CRM & Leads</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage incoming leads from landing pages and convert them to bookings.</p>
      </div>
      <div className="flex-1 overflow-x-auto bg-slate-50/50 p-6">
        <CrmBoard />
      </div>
    </div>
  );
}

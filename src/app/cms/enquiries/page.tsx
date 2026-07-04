import { Inbox, Search, Filter, Phone, Mail, User } from "lucide-react";

const MOCK_ENQUIRIES = [
  { id: "ENQ-801", name: "Siddharth Malhotra", email: "sid.m@example.com", phone: "+91 98765 43210", destination: "Havelock & Neil Island", status: "New", agent: "Unassigned" },
  { id: "ENQ-802", name: "Ananya Pandey", email: "ananya@example.com", phone: "+91 98877 66554", destination: "Maldives Luxury", status: "Contacted", agent: "Ravi Kumar" },
  { id: "ENQ-803", name: "Varun Dhawan", email: "varun.d@example.com", phone: "+91 91234 56789", destination: "Andaman Adventurer", status: "Proposal Sent", agent: "Pooja Mehta" },
  { id: "ENQ-804", name: "Shraddha Kapoor", email: "shraddha@example.com", phone: "+91 98712 34567", destination: "Port Blair Short Stay", status: "Closed Won", agent: "Ravi Kumar" },
];

export default function EnquiriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor client vacation requests, assign support agents, and track conversion statuses.
          </p>
        </div>
      </div>

      {/* Enquiries Inbox */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search enquiries by name or email..."
              className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Enquiry ID</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold">Requested Destination</th>
                <th className="px-6 py-4 font-semibold">Assigned Agent</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_ENQUIRIES.map((enq) => (
                <tr key={enq.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                    {enq.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                    {enq.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {enq.email}</div>
                    <div className="flex items-center gap-1.5 mt-0.5"><Phone className="h-3 w-3" /> {enq.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">
                    {enq.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-xs">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {enq.agent}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      enq.status === 'New' ? 'bg-blue-100 text-blue-700' :
                      enq.status === 'Contacted' ? 'bg-amber-100 text-amber-700' :
                      enq.status === 'Proposal Sent' ? 'bg-purple-100 text-purple-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {enq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button className="text-primary hover:underline font-semibold text-xs mr-3">Build Proposal</button>
                    <button className="text-muted-foreground hover:text-foreground font-semibold text-xs">Assign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

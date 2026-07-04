import { Calendar, Search, Filter, IndianRupee } from "lucide-react";

const MOCK_ACTIVITY_BOOKINGS = [
  { id: "AB-5001", customer: "Arjun Verma", activity: "Scuba Diving at Elephant Beach", date: "Oct 13", slot: "09:00 AM", pax: 2, amount: 7000, status: "Vouchered" },
  { id: "AB-5002", customer: "Priya Singh", activity: "Coral Safari Semi Submarine", date: "Nov 06", slot: "11:00 AM", pax: 2, amount: 4400, status: "Vouchered" },
  { id: "AB-5003", customer: "Rohan Das", activity: "Jet Ski Ride at Water Sports Complex", date: "Sep 21", slot: "04:30 PM", pax: 4, amount: 3200, status: "Completed" },
  { id: "AB-5004", customer: "Kriti Sanon", activity: "Baratang Limestone Caves Tour", date: "Dec 11", slot: "06:00 AM", pax: 1, amount: 4500, status: "Pending" },
];

export default function ActivityBookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track booked tickets, timings, slots, and service vouchers for traveler activities.
          </p>
        </div>
      </div>

      {/* Activity Bookings Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search activity bookings..."
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
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Activity</th>
                <th className="px-6 py-4 font-semibold">Date & Slot</th>
                <th className="px-6 py-4 font-semibold">Tickets (Pax)</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_ACTIVITY_BOOKINGS.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                    {booking.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-foreground flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {booking.activity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                    <div className="font-semibold text-foreground">{booking.date}</div>
                    <div>{booking.slot}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.pax} Ticket{booking.pax > 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground">
                    <div className="flex items-center">
                      <IndianRupee className="h-3.5 w-3.5" /> {booking.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                      booking.status === 'Vouchered' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button className="text-primary hover:underline font-semibold text-xs">Voucher</button>
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

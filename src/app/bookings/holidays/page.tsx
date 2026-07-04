import { Luggage, Search, Filter, IndianRupee } from "lucide-react";

const MOCK_HOLIDAY_BOOKINGS = [
  { id: "HB-7001", customer: "Arjun Verma", package: "Premium Andaman Escape", date: "Oct 12 - Oct 17", travelers: 2, amount: 110000, status: "Confirmed" },
  { id: "HB-7002", customer: "Priya Singh", package: "Maldives Honeymoon Special", date: "Nov 05 - Nov 10", travelers: 2, amount: 245000, status: "Pending" },
  { id: "HB-7003", customer: "Rohan Das", package: "Bali Retreat & Spa", date: "Sep 20 - Sep 25", travelers: 4, amount: 85000, status: "Confirmed" },
  { id: "HB-7004", guest: "Vikram & Family", package: "Andaman Family Trip", date: "Oct 22 - Oct 28", travelers: 6, amount: 180000, status: "Confirmed" },
];

export default function HolidayBookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Holiday Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Oversee and fulfill holiday package itineraries, payments, and client travel plans.
          </p>
        </div>
      </div>

      {/* Holiday Bookings Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search holiday bookings..."
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
                <th className="px-6 py-4 font-semibold">Lead Traveler</th>
                <th className="px-6 py-4 font-semibold">Package Itinerary</th>
                <th className="px-6 py-4 font-semibold">Dates & Pax</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_HOLIDAY_BOOKINGS.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                    {booking.customer || booking.guest}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-primary flex items-center gap-1.5">
                      <Luggage className="h-3.5 w-3.5 text-muted-foreground" />
                      {booking.package}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">{booking.date}</div>
                    <div>{booking.travelers} Travelers</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground">
                    <div className="flex items-center">
                      <IndianRupee className="h-3.5 w-3.5" /> {booking.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button className="text-primary hover:underline font-semibold text-xs mr-3">Itinerary</button>
                    <button className="text-muted-foreground hover:text-foreground font-semibold text-xs">Voucher</button>
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

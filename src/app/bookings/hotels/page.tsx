import { Receipt, Search, Filter, IndianRupee } from "lucide-react";

const MOCK_HOTEL_BOOKINGS = [
  { id: "HB-4001", guest: "Amit Sharma", hotel: "Symphony Palms Beach Resort", dates: "Oct 12 - Oct 15", rooms: 2, nights: 3, amount: 51000, status: "Checked In" },
  { id: "HB-4002", guest: "Deepika Padukone", hotel: "Taj Exotica Resort & Spa", dates: "Nov 05 - Nov 07", rooms: 1, nights: 2, amount: 76000, status: "Confirmed" },
  { id: "HB-4003", guest: "Rohit Khandelwal", hotel: "Sea Shell Port Blair", dates: "Sep 20 - Sep 22", rooms: 3, nights: 2, amount: 45000, status: "Checked Out" },
  { id: "HB-4004", guest: "Kriti Sanon", hotel: "Summer Sands Beach Resort", dates: "Dec 10 - Dec 14", rooms: 1, nights: 4, amount: 36800, status: "Cancelled" },
];

export default function HotelBookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hotel Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all standalone and packaged hotel room reservations.
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Booking ID or guest name..."
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
                <th className="px-6 py-4 font-semibold">Guest Name</th>
                <th className="px-6 py-4 font-semibold">Hotel Property</th>
                <th className="px-6 py-4 font-semibold">Stay Details</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_HOTEL_BOOKINGS.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                    {booking.guest}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-primary flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                      {booking.hotel}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                    <div className="font-semibold text-foreground">{booking.dates}</div>
                    <div>{booking.rooms} Rooms • {booking.nights} Nights</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground">
                    <div className="flex items-center">
                      <IndianRupee className="h-3.5 w-3.5" /> {booking.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'Checked In' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      booking.status === 'Checked Out' ? 'bg-purple-100 text-purple-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button className="text-primary hover:underline font-semibold text-xs">View Voucher</button>
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

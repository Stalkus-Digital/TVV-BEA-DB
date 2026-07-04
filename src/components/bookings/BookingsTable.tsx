"use client";

import { 
  Search, 
  Filter, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  IndianRupee
} from "lucide-react";

const MOCK_BOOKINGS = [
  { id: "B-8902", customer: "Arjun Verma", email: "arjun.v@example.com", package: "Premium Andaman Escape", date: "Oct 12 - Oct 17", amount: 110000, status: "Confirmed", payment: "Paid" },
  { id: "B-8901", customer: "Priya Singh", email: "priya.singh@example.com", package: "Maldives Honeymoon", date: "Nov 05 - Nov 10", amount: 245000, status: "Pending", payment: "Partial" },
  { id: "B-8900", customer: "Rohan Das", email: "rohan.d@example.com", package: "Bali Retreat", date: "Sep 20 - Sep 25", amount: 85000, status: "Confirmed", payment: "Paid" },
  { id: "B-8899", customer: "Neha Gupta", email: "neha.g@example.com", package: "Dubai Shopping Fest", date: "Dec 10 - Dec 15", amount: 130000, status: "Cancelled", payment: "Refunded" },
  { id: "B-8898", customer: "Vikram & Family", email: "vikram@example.com", package: "Andaman Family Trip", date: "Oct 22 - Oct 28", amount: 180000, status: "Confirmed", payment: "Paid" },
];

export function BookingsTable() {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings by ID, customer, or package..."
            className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Booking ID</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Package & Dates</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Payment</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_BOOKINGS.map((booking) => (
              <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                  {booking.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-foreground">{booking.customer}</div>
                  <div className="text-muted-foreground text-xs">{booking.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-primary">{booking.package}</div>
                  <div className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                    {booking.date}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold flex items-center">
                    <IndianRupee className="h-3.5 w-3.5" /> {booking.amount.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    booking.payment === 'Paid' ? 'bg-blue-100 text-blue-700' :
                    booking.payment === 'Partial' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {booking.payment}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-slate-50/50">
        <div>Showing 1 to 5 of 24 entries</div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-muted border border-transparent hover:border-border rounded transition-colors disabled:opacity-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded font-medium">1</button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded font-medium transition-colors">2</button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded font-medium transition-colors">3</button>
          <span className="px-2">...</span>
          <button className="p-1.5 hover:bg-muted border border-transparent hover:border-border rounded transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
}

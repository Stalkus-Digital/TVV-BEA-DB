"use client";

import { 
  Search, 
  Filter, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  MapPin,
  Clock,
  Sparkles
} from "lucide-react";

const MOCK_PACKAGES = [
  { id: "PKG-001", title: "Premium Andaman Escape", destination: "Andaman", duration: "5D/4N", basePrice: 45000, dynamic: true, status: "Published" },
  { id: "PKG-002", title: "Maldives Honeymoon Special", destination: "Maldives", duration: "6D/5N", basePrice: 125000, dynamic: true, status: "Published" },
  { id: "PKG-003", title: "Bali Retreat (AI Generated)", destination: "Bali", duration: "7D/6N", basePrice: 75000, dynamic: false, status: "Draft" },
  { id: "PKG-004", title: "Dubai Shopping Fest", destination: "Dubai", duration: "4D/3N", basePrice: 55000, dynamic: true, status: "Published" },
  { id: "PKG-005", title: "Kerala Backwaters", destination: "Kerala", duration: "5D/4N", basePrice: 32000, dynamic: false, status: "Archived" },
];

export function PackageTable() {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search packages..."
            className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Package Title</th>
              <th className="px-6 py-4 font-semibold">Destination</th>
              <th className="px-6 py-4 font-semibold">Duration</th>
              <th className="px-6 py-4 font-semibold">Base Price</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_PACKAGES.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    {pkg.title}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">{pkg.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {pkg.destination}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" /> {pkg.duration}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium flex items-center">
                    <IndianRupee className="h-3.5 w-3.5" /> {pkg.basePrice.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {pkg.dynamic ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md w-fit">
                      <Sparkles className="h-3 w-3" /> Dynamic
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                      Fixed
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    pkg.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                    pkg.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {pkg.status}
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
        <div>Showing 1 to 5 of 12 entries</div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-muted border border-transparent hover:border-border rounded transition-colors disabled:opacity-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded font-medium">1</button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded font-medium transition-colors">2</button>
          <span className="px-2">...</span>
          <button className="p-1.5 hover:bg-muted border border-transparent hover:border-border rounded transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
}

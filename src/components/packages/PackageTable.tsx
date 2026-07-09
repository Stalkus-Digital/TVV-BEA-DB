"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  MapPin,
  Clock,
  Sparkles,
  Loader2
} from "lucide-react";
import { usePackagesQueryState } from "@/features/admin-packages/hooks/usePackagesQuery";

export function PackageTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const { data, isLoading, isError } = usePackagesQueryState({
    search,
    page,
    pageSize
  });

  const packages = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search packages..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading holiday packages...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-destructive">
                  Error loading packages. Please try again.
                </td>
              </tr>
            ) : packages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No packages found matching your criteria.
                </td>
              </tr>
            ) : (
              packages.map((pkg: any) => (
                <tr key={pkg.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      {pkg.internalName || pkg.title || "Untitled Package"}
                    </div>
                    <div className="text-muted-foreground text-xs mt-0.5">{pkg.id.substring(0, 8).toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" /> {pkg.destinations?.[0]?.name || "Multiple"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" /> {pkg.durationDays}D/{pkg.durationNights}N
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {pkg.pricingType === "DYNAMIC" ? (
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
                      pkg.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                      pkg.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' :
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && !isError && packages.length > 0 && (
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-slate-50/50">
          <div>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} entries</div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePrevPage}
              disabled={page === 1}
              className="p-1.5 hover:bg-muted border border-transparent hover:border-border rounded transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded font-medium">
              {page}
            </button>
            <button 
              onClick={handleNextPage}
              disabled={page >= totalPages}
              className="p-1.5 hover:bg-muted border border-transparent hover:border-border rounded transition-colors disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

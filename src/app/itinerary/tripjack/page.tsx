"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layers, RefreshCw, CheckCircle, AlertTriangle, Search, Sliders, Loader2 } from "lucide-react";

export default function TripJackPackagesPage() {
  const [search, setSearch] = useState("");

  const { data: packagesResponse, isLoading, isError } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await fetch("/api/packages");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const packages = packagesResponse?.data?.items ?? [];

  const filteredPackages = packages.filter((pkg: any) => 
    (pkg.title || pkg.internalName)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trip Jack Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Map and sync package feeds, pricing schedules, and live availability via the Trip Jack API integrations.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors">
          <RefreshCw className="h-4 w-4" /> Trigger Global Sync
        </button>
      </div>

      {/* Connection Info */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">API Connection Active</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Connected to Trip Jack Travel Gateway Production API</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          <div className="px-3 py-2 border border-border rounded-lg bg-slate-50/50">
            <span className="text-muted-foreground">API Quota:</span> 48,291 / 100,000 requests
          </div>
          <div className="px-3 py-2 border border-border rounded-lg bg-slate-50/50">
            <span className="text-muted-foreground">Global Markup:</span> +10.0%
          </div>
        </div>
      </div>

      {/* Sync Packages Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search synced packages..."
              className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors">
            <Sliders className="h-4 w-4" /> Global Markup Rules
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">TJ Package ID</th>
                <th className="px-6 py-4 font-semibold">Package Name</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Sync Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Syncing live TripJack packages...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-destructive">
                    Failed to communicate with API.
                  </td>
                </tr>
              ) : filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No active packages synced from TripJack. Click &apos;Trigger Global Sync&apos; to pull down live inventory.
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg: any) => (
                  <tr key={pkg.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                      {pkg.id.substring(0, 10).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                      {pkg.internalName || pkg.title || "Untitled Package"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {pkg.durationDays}D/{pkg.durationNights}N
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 w-fit bg-emerald-100 text-emerald-700">
                        <CheckCircle className="h-3 w-3" />
                        Synced
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button className="text-primary hover:underline font-semibold text-xs mr-3">Sync Now</button>
                      <button className="text-muted-foreground hover:text-foreground font-semibold text-xs">Edit Rules</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

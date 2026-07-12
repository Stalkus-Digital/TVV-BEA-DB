"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ship, Plus, Search, Filter, ArrowUpDown, X, Loader2 } from "lucide-react";

interface FerryRate {
  id: string;
  route: string;
  operator: string;
  class: string;
  fare: number;
  surcharge: number;
  total: number;
  status: "Active" | "Inactive";
}

export default function FerryRatesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRate, setNewRate] = useState<Partial<FerryRate>>({
    route: "Port Blair ➔ Havelock",
    operator: "Makruzz",
    class: "Premium",
    fare: 1000,
    surcharge: 100,
    status: "Active",
  });

  const { data: ratesResponse, isLoading } = useQuery({
    queryKey: ["ferry-rates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ferries");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (rate: Partial<FerryRate>) => {
      const res = await fetch("/api/admin/ferries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rate),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferry-rates"] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/ferries?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferry-rates"] });
    }
  });

  const rates: FerryRate[] = ratesResponse?.data ?? [];

  const filteredRates = rates.filter(r => 
    r.operator.toLowerCase().includes(search.toLowerCase()) || 
    r.route.toLowerCase().includes(search.toLowerCase()) ||
    r.class.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const fare = Number(newRate.fare) || 0;
    const surcharge = Number(newRate.surcharge) || 0;
    createMutation.mutate({
      route: newRate.route || "",
      operator: newRate.operator || "",
      class: newRate.class || "",
      fare,
      surcharge,
      total: fare + surcharge,
      status: newRate.status as "Active" | "Inactive" || "Active",
    });
  };

  const operatorsCount = new Set(rates.filter(r => r.status === "Active").map(r => r.operator)).size;
  const routesCount = new Set(rates.map(r => r.route)).size;
  const premiumRates = rates.filter(r => r.class === "Premium" && r.status === "Active");
  const avgPremium = premiumRates.length 
    ? premiumRates.reduce((acc, r) => acc + r.total, 0) / premiumRates.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ferry Rate Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage ferry ticket prices, fuel surcharges, and operator classes across island routes.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Ferry Rate
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Ship className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Operators</p>
              <h3 className="text-2xl font-bold">{operatorsCount} Operators</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monitored Routes</p>
              <h3 className="text-2xl font-bold">{routesCount} Routes</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Premium Ticket</p>
              <h3 className="text-2xl font-bold">₹{avgPremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by operator, route, or class..."
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
                <th className="px-6 py-4 font-semibold">Rate ID</th>
                <th className="px-6 py-4 font-semibold">Route</th>
                <th className="px-6 py-4 font-semibold">Operator & Class</th>
                <th className="px-6 py-4 font-semibold">Base Fare</th>
                <th className="px-6 py-4 font-semibold">Surcharge</th>
                <th className="px-6 py-4 font-semibold">Total Cost</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading ferry rates...
                  </td>
                </tr>
              ) : filteredRates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    No ferry rates found matching your search.
                  </td>
                </tr>
              ) : (
                filteredRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                      {rate.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                      {rate.route}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{rate.operator}</div>
                      <div className="text-muted-foreground text-xs">{rate.class} Class</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₹{rate.fare.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₹{rate.surcharge.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-primary">
                      ₹{rate.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        rate.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {rate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button className="text-primary hover:underline font-medium mr-3">Edit</button>
                      <button 
                        onClick={() => deleteMutation.mutate(rate.id)}
                        disabled={deleteMutation.isPending}
                        className="text-muted-foreground hover:text-destructive font-medium disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50/50">
              <h2 className="text-lg font-bold text-foreground">Add New Ferry Rate</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Route</label>
                <select 
                  required
                  value={newRate.route} 
                  onChange={(e) => setNewRate({...newRate, route: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                >
                  <option value="Port Blair ➔ Havelock">Port Blair ➔ Havelock</option>
                  <option value="Havelock ➔ Port Blair">Havelock ➔ Port Blair</option>
                  <option value="Havelock ➔ Neil Island">Havelock ➔ Neil Island</option>
                  <option value="Neil Island ➔ Havelock">Neil Island ➔ Havelock</option>
                  <option value="Neil Island ➔ Port Blair">Neil Island ➔ Port Blair</option>
                  <option value="Port Blair ➔ Neil Island">Port Blair ➔ Neil Island</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Operator</label>
                  <input 
                    required
                    type="text"
                    value={newRate.operator} 
                    onChange={(e) => setNewRate({...newRate, operator: e.target.value})}
                    placeholder="e.g. Makruzz"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Class</label>
                  <input 
                    required
                    type="text"
                    value={newRate.class} 
                    onChange={(e) => setNewRate({...newRate, class: e.target.value})}
                    placeholder="e.g. Premium"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Base Fare (₹)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    value={newRate.fare} 
                    onChange={(e) => setNewRate({...newRate, fare: Number(e.target.value)})}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Surcharge (₹)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    value={newRate.surcharge} 
                    onChange={(e) => setNewRate({...newRate, surcharge: Number(e.target.value)})}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total Cost (₹) - Auto Calculated</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-foreground">
                  ₹{((Number(newRate.fare) || 0) + (Number(newRate.surcharge) || 0)).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select 
                  value={newRate.status} 
                  onChange={(e) => setNewRate({...newRate, status: e.target.value as "Active" | "Inactive"})}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3 mt-1">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
                >
                  {createMutation.isPending ? "Saving..." : "Add Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

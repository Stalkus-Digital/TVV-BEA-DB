"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";


interface FerryRate {
  id: string;
  route: string;
  provider: string;
  class: string;
  basePrice: number;
  markupPrice: number;
  updatedAt: string;
}

export default function FerryAdminPage() {
  const [rates, setRates] = useState<FerryRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    route: "",
    provider: "",
    class: "",
    basePrice: "",
    markupPrice: "",
  });
  const [rateToDelete, setRateToDelete] = useState<string | null>(null);

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/admin/ferries");
      const data = await res.json();
      setRates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/ferries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAdding(false);
        setFormData({ route: "", provider: "", class: "", basePrice: "", markupPrice: "" });
        fetchRates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!rateToDelete) return;
    try {
      await fetch(`/api/admin/ferries?id=${rateToDelete}`, { method: "DELETE" });
      setRateToDelete(null);
      fetchRates();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ferry Rates Management</h1>
          <p className="text-muted-foreground mt-1">Manage manual ferry inventory and dynamic pricing.</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors">
          <Plus className="h-4 w-4" /> Add Rate
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-card p-6 border rounded-xl shadow-sm grid grid-cols-2 gap-4">
          <div className="space-y-2">
             <label className="text-sm font-medium">Route</label>
             <input required value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} className="w-full border p-2 rounded" placeholder="e.g. Port Blair to Havelock" />
          </div>
          <div className="space-y-2">
             <label className="text-sm font-medium">Provider</label>
             <input required value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} className="w-full border p-2 rounded" placeholder="e.g. Makruzz" />
          </div>
          <div className="space-y-2">
             <label className="text-sm font-medium">Class</label>
             <input required value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full border p-2 rounded" placeholder="e.g. Premium" />
          </div>
          <div className="space-y-2">
             <label className="text-sm font-medium">Base Price (Cost)</label>
             <input required type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} className="w-full border p-2 rounded" placeholder="1000" />
          </div>
          <div className="space-y-2">
             <label className="text-sm font-medium">Markup Price (Selling)</label>
             <input required type="number" value={formData.markupPrice} onChange={e => setFormData({...formData, markupPrice: e.target.value})} className="w-full border p-2 rounded" placeholder="1500" />
          </div>
          <div className="col-span-2 flex justify-end gap-2 mt-4">
             <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-semibold transition-colors">Cancel</button>
             <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded shadow-sm hover:bg-primary-hover transition-colors">Save Rate</button>
          </div>
        </form>
      )}

      <div className="border rounded-xl bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 font-medium">Route</th>
              <th className="p-4 font-medium">Provider</th>
              <th className="p-4 font-medium">Class</th>
              <th className="p-4 font-medium">Cost Price</th>
              <th className="p-4 font-medium">Selling Price</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : rates.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No ferry rates found.</td></tr>
            ) : (
              rates.map((rate) => (
                <tr key={rate.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-4 font-medium">{rate.route}</td>
                  <td className="p-4">{rate.provider}</td>
                  <td className="p-4">{rate.class}</td>
                  <td className="p-4">₹{rate.basePrice}</td>
                  <td className="p-4 font-medium text-emerald-600">₹{rate.markupPrice}</td>
                  <td className="p-4">
                    <button onClick={() => setRateToDelete(rate.id)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setRateToDelete(null)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white dark:bg-slate-900 shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Ferry Rate</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this ferry rate?</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRateToDelete(null)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

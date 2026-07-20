"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Edit, RefreshCw, Search, Ship } from "lucide-react";
import { adminApiClient } from "@/lib/admin-api/client";
import { ToastContainer } from "@/features/admin-destinations/components/ToastContainer";
import { useToast } from "@/features/admin-destinations/hooks/useToast";

interface FerryRate {
  id: string;
  route: string;
  provider: string;
  class: string;
  basePrice: number;
  markupPrice: number;
  updatedAt: string;
}

const EMPTY_FORM = { route: "", provider: "", class: "", basePrice: "", markupPrice: "" };

export default function FerryAdminPage() {
  const [rates, setRates] = useState<FerryRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rateToDelete, setRateToDelete] = useState<string | null>(null);
  const toast = useToast();

  const fetchRates = async () => {
    setLoadError(null);
    try {
      const data = await adminApiClient.get<FerryRate[]>("/api/admin/ferries");
      setRates(data || []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load ferry rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const filteredRates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rates;
    return rates.filter(
      (r) =>
        r.route.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        r.class.toLowerCase().includes(q)
    );
  }, [rates, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const base = Number(formData.basePrice);
    const markup = Number(formData.markupPrice);
    if (Number.isNaN(base) || base <= 0) {
      setFormError("Base price must be a positive number.");
      return;
    }
    if (Number.isNaN(markup) || markup <= 0) {
      setFormError("Selling price must be a positive number.");
      return;
    }
    if (markup < base) {
      setFormError("Selling price is below cost price — check the numbers before saving.");
      return;
    }
    const duplicate = rates.some(
      (r) =>
        r.id !== editingRateId &&
        r.route.trim().toLowerCase() === formData.route.trim().toLowerCase() &&
        r.provider.trim().toLowerCase() === formData.provider.trim().toLowerCase() &&
        r.class.trim().toLowerCase() === formData.class.trim().toLowerCase()
    );
    if (duplicate) {
      setFormError("A rate for this route, provider, and class already exists. Edit the existing rate instead.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingRateId) {
        await adminApiClient.put(`/api/admin/ferries`, { ...formData, id: editingRateId });
        toast.success("Ferry rate updated", `${formData.route} · ${formData.class}`);
      } else {
        await adminApiClient.post("/api/admin/ferries", formData);
        toast.success("Ferry rate created", `${formData.route} · ${formData.class}`);
      }
      setIsAdding(false);
      setEditingRateId(null);
      setFormData(EMPTY_FORM);
      fetchRates();
    } catch (e) {
      toast.error(
        editingRateId ? "Failed to update ferry rate" : "Failed to create ferry rate",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (rate: FerryRate) => {
    setEditingRateId(rate.id);
    setFormError(null);
    setFormData({
      route: rate.route,
      provider: rate.provider,
      class: rate.class,
      basePrice: rate.basePrice.toString(),
      markupPrice: rate.markupPrice.toString(),
    });
    setIsAdding(true);
  };

  const handleDelete = async () => {
    if (!rateToDelete) return;
    const deleted = rates.find((r) => r.id === rateToDelete);
    try {
      await adminApiClient.delete(`/api/admin/ferries?id=${rateToDelete}`);
      setRateToDelete(null);
      toast.success("Ferry rate deleted", deleted ? `${deleted.route} · ${deleted.class}` : undefined);
      fetchRates();
    } catch (e) {
      toast.error("Failed to delete ferry rate", e instanceof Error ? e.message : undefined);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ferry Rates Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage manual ferry inventory and dynamic pricing. Operator API credentials live in{" "}
            <a href="/operations/integrations" className="text-blue-600 hover:underline">
              Integrations
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              void fetchRates();
            }}
            className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingRateId(null);
              setFormError(null);
              setFormData(EMPTY_FORM);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" /> {isAdding && !editingRateId ? "Cancel" : "Add Rate"}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-card p-6 border rounded-xl shadow-sm grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Route</label>
            <input
              required
              maxLength={120}
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="e.g. Port Blair to Havelock"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Provider</label>
            <input
              required
              maxLength={80}
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="e.g. Makruzz"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Class</label>
            <input
              required
              maxLength={60}
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="e.g. Premium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Base Price (Cost)</label>
            <input
              required
              type="number"
              min={1}
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="1000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Markup Price (Selling)</label>
            <input
              required
              type="number"
              min={1}
              value={formData.markupPrice}
              onChange={(e) => setFormData({ ...formData, markupPrice: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="1500"
            />
          </div>
          {formError && (
            <p className="col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {formError}
            </p>
          )}
          <div className="col-span-2 flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingRateId(null);
                setFormError(null);
              }}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving…" : editingRateId ? "Update Rate" : "Save Rate"}
            </button>
          </div>
        </form>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-border rounded-md pl-9 pr-3 py-2 text-sm"
          placeholder="Search route, provider, or class…"
        />
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b sticky top-0">
            <tr>
              <th className="p-4 font-medium">Route</th>
              <th className="p-4 font-medium">Provider</th>
              <th className="p-4 font-medium">Class</th>
              <th className="p-4 font-medium">Cost Price</th>
              <th className="p-4 font-medium">Selling Price</th>
              <th className="p-4 font-medium">Margin</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="border-b last:border-0">
                  <td colSpan={7} className="p-4">
                    <div className="h-6 bg-muted rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : loadError ? (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <p className="text-red-600 font-medium">{loadError}</p>
                  <button
                    onClick={() => {
                      setLoading(true);
                      void fetchRates();
                    }}
                    className="mt-3 px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : filteredRates.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  <Ship className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  {search
                    ? "No ferry rates match your search."
                    : "No ferry rates found. Click “Add Rate” to create the first one."}
                </td>
              </tr>
            ) : (
              filteredRates.map((rate) => {
                const margin = rate.markupPrice - rate.basePrice;
                return (
                  <tr key={rate.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-4 font-medium">{rate.route}</td>
                    <td className="p-4">{rate.provider}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-xs border border-border bg-muted/40">
                        {rate.class}
                      </span>
                    </td>
                    <td className="p-4">₹{rate.basePrice.toLocaleString()}</td>
                    <td className="p-4 font-medium text-emerald-600">₹{rate.markupPrice.toLocaleString()}</td>
                    <td className={`p-4 text-xs font-medium ${margin >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      {margin >= 0 ? "+" : ""}₹{margin.toLocaleString()}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => openEdit(rate)}
                        className="text-primary hover:text-primary-hover font-medium"
                        title="Edit rate"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setRateToDelete(rate.id)}
                        className="text-rose-500 hover:text-rose-700"
                        title="Delete rate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {rateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setRateToDelete(null)}
            aria-label="Cancel"
          />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Ferry Rate</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this ferry rate? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRateToDelete(null)}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
              >
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

      <ToastContainer />
    </div>
  );
}

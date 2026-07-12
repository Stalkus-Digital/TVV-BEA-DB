"use client";

import { useCampaignsQuery } from "../hooks/useMarketingQueries";
import { MarketingPageShell } from "./MarketingPageShell";
import { useState } from "react";
import { adminApiClient } from "@/lib/admin-api/client";

type Campaign = {
  id: string;
  name: string;
  type: string;
  status: string;
  budget: number;
  startDate?: string | null;
  endDate?: string | null;
};

type CampaignForm = {
  name: string;
  type: string;
  status: string;
  budget: number;
  startDate: string;
  endDate: string;
};

const EMPTY_FORM: CampaignForm = { name: "", type: "EMAIL", status: "DRAFT", budget: 0, startDate: "", endDate: "" };

export function CampaignsPage() {
  const campaignsQuery = useCampaignsQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignForm>(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setIsEditing(true);
  }

  function openEdit(c: Campaign) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      type: c.type,
      status: c.status,
      budget: c.budget,
      startDate: c.startDate ? c.startDate.slice(0, 10) : "",
      endDate: c.endDate ? c.endDate.slice(0, 10) : "",
    });
    setError(null);
    setIsEditing(true);
  }

  async function saveCampaign(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (editingId) {
        await adminApiClient.put(`/api/marketing/campaigns/${editingId}`, form);
      } else {
        await adminApiClient.post("/api/marketing/campaigns", form);
      }
      setIsEditing(false);
      void campaignsQuery.refetch();
    } catch (err) {
      setError("Failed to save campaign. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete(id: string) {
    setConfirmDeleteId(id);
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    try {
      await adminApiClient.delete(`/api/marketing/campaigns/${confirmDeleteId}`);
      void campaignsQuery.refetch();
      setConfirmDeleteId(null);
    } catch (err) {
      setError("Failed to delete campaign. Please try again.");
    }
  }

  return (
    <MarketingPageShell
      title="Campaigns"
      description="Manage and track your marketing campaigns."
      isLoading={campaignsQuery.isLoading}
      isError={campaignsQuery.isError}
      errorMessage={campaignsQuery.error instanceof Error ? campaignsQuery.error.message : undefined}
      isRefreshing={campaignsQuery.isFetching}
      onRefresh={() => void campaignsQuery.refetch()}
      onRetry={() => void campaignsQuery.refetch()}
    >
      {error && (
        <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {!isEditing && (
          <button
            onClick={openCreate}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm"
          >
            + Create Campaign
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4">
        {isEditing ? (
          <form onSubmit={saveCampaign} className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold">{editingId ? "Edit Campaign" : "New Campaign"}</h3>
            <div>
              <label className="block text-xs font-medium mb-1">Campaign Name *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                placeholder="e.g. Summer Travel Promo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="EMAIL">Email</option>
                  <option value="SOCIAL">Social Media</option>
                  <option value="SEARCH">Search Ads</option>
                  <option value="DISPLAY">Display Ads</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Budget (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: Number(e.target.value) })}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving ? "Saving…" : editingId ? "Update Campaign" : "Create Campaign"}
              </button>
            </div>
          </form>
        ) : (
          campaignsQuery.data?.items?.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
              No campaigns created yet.
            </div>
          ) : (
            campaignsQuery.data?.items?.map(campaign => (
              <div key={campaign.id} className="p-4 border border-border bg-white rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground">{campaign.type} • {campaign.status}</p>
                  {(campaign.startDate || campaign.endDate) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString("en-IN") : "—"} →{" "}
                      {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString("en-IN") : "ongoing"}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <div className="text-right mr-2 text-sm text-muted-foreground">
                    <p>Budget: ₹{campaign.budget?.toLocaleString("en-IN")}</p>
                  </div>
                  <button
                    className="px-3 py-1 text-sm border rounded hover:bg-muted transition-colors"
                    onClick={() => openEdit(campaign)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 text-sm border rounded text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => confirmDelete(campaign.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Campaign</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this campaign? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
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
    </MarketingPageShell>
  );
}

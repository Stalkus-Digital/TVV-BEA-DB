"use client";

import { useCampaignsQuery } from "../hooks/useMarketingQueries";
import { MarketingPageShell } from "./MarketingPageShell";
import { useState } from "react";
import { adminApiClient } from "@/lib/admin-api/client";

export function CampaignsPage() {
  const campaignsQuery = useCampaignsQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "", type: "EMAIL", status: "DRAFT", budget: 0 });

  async function saveCampaign(e: React.FormEvent) {
    e.preventDefault();
    try {
      await adminApiClient.post("/api/marketing/campaigns", form);
      setIsEditing(false);
      campaignsQuery.refetch();
    } catch (err) {
      alert("Failed to save campaign");
    }
  }

  async function deleteCampaign(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await adminApiClient.delete(`/api/marketing/campaigns/${id}`);
      campaignsQuery.refetch();
    } catch (err) {
      alert("Failed to delete campaign");
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
      <div className="mt-6 flex justify-end">
        {!isEditing && (
          <button onClick={() => { setForm({ name: "", type: "EMAIL", status: "DRAFT", budget: 0 }); setIsEditing(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm">
            + Create Campaign
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4">
        {isEditing ? (
          <form onSubmit={saveCampaign} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">Campaign Name</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm">
                  <option value="EMAIL">Email</option>
                  <option value="SOCIAL">Social Media</option>
                  <option value="SEARCH">Search Ads</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Budget</label>
                <input type="number" required value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90">Save</button>
            </div>
          </form>
        ) : (
          campaignsQuery.data?.items?.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
              No campaigns created yet.
            </div>
          ) : (
            campaignsQuery.data?.items?.map(campaign => (
              <div key={campaign.id} className="p-4 border border-border bg-card rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground">{campaign.type} • {campaign.status}</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-right mr-4 text-sm text-muted-foreground">
                    <p>Budget: ${campaign.budget}</p>
                  </div>
                  <button className="px-3 py-1 text-sm border rounded text-destructive hover:bg-destructive/10" onClick={() => deleteCampaign(campaign.id)}>Delete</button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </MarketingPageShell>
  );
}

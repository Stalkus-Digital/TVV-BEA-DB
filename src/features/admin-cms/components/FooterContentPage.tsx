"use client";

import { useState } from "react";
import { useUpdateCmsConfigMutation } from "../hooks/useCmsMutations";
import { useWebsiteNavigationQuery } from "../hooks/useCmsQueries";
import { CmsPageShell } from "./CmsPageShell";

export function FooterContentPage() {
  const navigationQuery = useWebsiteNavigationQuery();
  const configMutation = useUpdateCmsConfigMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [footerForm, setFooterForm] = useState<{ title: string; links: { label: string; url: string }[] }[]>([]);

  async function saveFooter(e: React.FormEvent) {
    e.preventDefault();
    try {
      await configMutation.mutateAsync({
        key: "FOOTER",
        value: { columns: footerForm.filter(c => c.title) }
      });
      setIsEditing(false);
    } catch (err) {
      alert("Failed to save footer columns");
    }
  }

  return (
    <CmsPageShell
      title="Footer Content"
      description="Manage the footer columns and links displayed across the website."
      isLoading={navigationQuery.isLoading}
      isError={navigationQuery.isError}
      errorMessage={navigationQuery.error instanceof Error ? navigationQuery.error.message : undefined}
      isRefreshing={navigationQuery.isFetching}
      onRefresh={() => void navigationQuery.refetch()}
      onRetry={() => void navigationQuery.refetch()}
    >
      <div className="flex items-center justify-between mt-6 mb-4">
        <h2 className="text-lg font-semibold">Footer Columns</h2>
        {!isEditing && (
          <button
            onClick={() => {
              setFooterForm(navigationQuery.data?.footer?.columns?.map(c => ({ title: c.title, links: c.links.map(l => ({ ...l })) })) ?? []);
              setIsEditing(true);
            }}
            className="text-sm text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={saveFooter} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          {footerForm.map((column, colIdx) => (
            <div key={colIdx} className="space-y-3 p-4 border border-border rounded-md relative">
              <button type="button" onClick={() => setFooterForm(footerForm.filter((_, i) => i !== colIdx))} className="absolute top-4 right-4 text-xs text-destructive hover:underline">Remove Column</button>
              <div>
                <label className="block text-xs font-medium mb-1">Column Title</label>
                <input required value={column.title} onChange={e => { const newForm = [...footerForm]; newForm[colIdx].title = e.target.value; setFooterForm(newForm); }} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium">Links</label>
                {column.links.map((link, linkIdx) => (
                  <div key={linkIdx} className="flex gap-2">
                    <input required placeholder="Label" value={link.label} onChange={e => { const newForm = [...footerForm]; newForm[colIdx].links[linkIdx].label = e.target.value; setFooterForm(newForm); }} className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm" />
                    <input required placeholder="URL" value={link.url} onChange={e => { const newForm = [...footerForm]; newForm[colIdx].links[linkIdx].url = e.target.value; setFooterForm(newForm); }} className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm" />
                    <button type="button" onClick={() => { const newForm = [...footerForm]; newForm[colIdx].links = newForm[colIdx].links.filter((_, i) => i !== linkIdx); setFooterForm(newForm); }} className="px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm">X</button>
                  </div>
                ))}
                <button type="button" onClick={() => { const newForm = [...footerForm]; newForm[colIdx].links.push({ label: "", url: "" }); setFooterForm(newForm); }} className="text-xs text-primary hover:underline">+ Add Link</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setFooterForm([...footerForm, { title: "", links: [] }])} className="text-sm text-primary hover:underline">+ Add Column</button>
          
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md">Cancel</button>
            <button type="submit" disabled={configMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-hover">Save</button>
          </div>
        </form>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {(navigationQuery.data?.footer.columns ?? []).map((column) => (
            <div key={column.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.url} className="flex justify-between text-sm">
                    <span>{link.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">{link.url}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Quick links</h2>
        <ul className="rounded-xl border border-border bg-card divide-y divide-border">
          {(navigationQuery.data?.quickLinks ?? []).map((link) => (
            <li key={link.url} className="px-4 py-3 text-sm flex justify-between">
              <span>{link.label}</span>
              <span className="font-mono text-xs text-muted-foreground">{link.url}</span>
            </li>
          ))}
        </ul>
      </section>
    </CmsPageShell>
  );
}

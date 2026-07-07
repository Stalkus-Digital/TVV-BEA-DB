"use client";

import { useState, useEffect } from "react";
import { CmsPageShell } from "./CmsPageShell";

export function LandingPagesManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/landing-pages")
      .then(res => res.json())
      .then(data => {
        if (data.success) setPages(data.data);
        setIsLoading(false);
      });
  }, []);

  return (
    <CmsPageShell title="Landing Pages Builder" description="Create and manage dynamic SEO destination landing pages.">
      <div className="mt-6 flex justify-end">
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm">
          + Create Landing Page
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        {isLoading ? (
          <p>Loading pages...</p>
        ) : pages.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
            No landing pages created yet.
          </div>
        ) : (
          pages.map(page => (
            <div key={page.id} className="p-4 border border-border bg-card rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{page.title}</h3>
                <p className="text-sm text-muted-foreground">/{page.slug}</p>
              </div>
              <div className="flex gap-2 items-center">
                <button className="px-3 py-1 text-sm border rounded hover:bg-muted text-emerald-600" onClick={() => window.open(`/api/admin/landing-pages/${page.id}/export?format=html`, '_blank')}>Export HTML</button>
                <button className="px-3 py-1 text-sm border rounded hover:bg-muted text-emerald-600" onClick={() => window.open(`/api/admin/landing-pages/${page.id}/export?format=php`, '_blank')}>Export PHP</button>
                <button className="px-3 py-1 text-sm border rounded hover:bg-muted ml-4">Edit</button>
                <button className="px-3 py-1 text-sm border rounded text-destructive hover:bg-destructive/10">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </CmsPageShell>
  );
}

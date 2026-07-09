"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/features/admin-enquiries/hooks/useDebouncedValue";
import { useAddFaqMutation, useRemoveFaqMutation } from "../hooks/useCmsMutations";
import { useCmsContentQuery } from "../hooks/useCmsQueries";
import { flattenFaqs } from "../utils";
import { CmsPageShell } from "./CmsPageShell";

export function FaqManagementPage() {
  const cms = useCmsContentQuery();
  const addMutation = useAddFaqMutation();
  const removeMutation = useRemoveFaqMutation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "destination" | "package">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [parentType, setParentType] = useState<"destination" | "package">("destination");
  const [parentId, setParentId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const faqs = useMemo(() => flattenFaqs(cms.destinations, cms.packages), [cms.destinations, cms.packages]);

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      if (typeFilter !== "all" && faq.parentType !== typeFilter) return false;
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.parentName.toLowerCase().includes(q)
      );
    });
  }, [faqs, typeFilter, debouncedSearch]);

  const parentOptions =
    parentType === "destination"
      ? cms.destinations.map((d) => ({ id: d.id, name: d.name }))
      : cms.packages.map((p) => ({ id: p.id, name: p.title }));

  async function handleAdd() {
    if (!parentId || !question.trim() || !answer.trim()) {
      setError("Parent, question, and answer are required");
      return;
    }
    setError(null);
    try {
      await addMutation.mutateAsync({ parentType, parentId, input: { question, answer } });
      setShowAdd(false);
      setQuestion("");
      setAnswer("");
      setParentId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add FAQ");
    }
  }

  async function handleRemove(faq: (typeof faqs)[number]) {
    if (!confirm("Remove this FAQ?")) return;
    setError(null);
    try {
      await removeMutation.mutateAsync({
        parentType: faq.parentType,
        parentId: faq.parentId,
        faqId: faq.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove FAQ");
    }
  }

  return (
    <CmsPageShell
      title="FAQ Management"
      description="Manage Frequently Asked Questions for destinations and holiday packages."
      isLoading={cms.isLoading}
      isError={cms.isError}
      errorMessage={cms.error instanceof Error ? cms.error.message : undefined}
      isRefreshing={cms.isFetching}
      onRefresh={() => void cms.refetch()}
      onRetry={() => void cms.refetch()}
      actions={
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground"
        >
          Add FAQ
        </button>
      }
    >
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="search"
          placeholder="Search FAQs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-background border border-input rounded-md px-3 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All parents</option>
          <option value="destination">Destinations</option>
          <option value="package">Packages</option>
        </select>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Question</th>
              <th className="text-left px-4 py-3 font-medium">Parent</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((faq) => (
              <tr key={`${faq.parentType}-${faq.parentId}-${faq.id}`} className="border-b border-border last:border-0 align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">{faq.question}</p>
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{faq.answer}</p>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={
                      faq.parentType === "destination"
                        ? `/destinations?selected=${faq.parentId}`
                        : `/packages?selected=${faq.parentId}`
                    }
                    className="text-primary hover:underline"
                  >
                    {faq.parentName}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{faq.parentType}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={removeMutation.isPending}
                    onClick={() => void handleRemove(faq)}
                    className="text-xs text-destructive hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No FAQs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30" onClick={() => setShowAdd(false)} aria-label="Close" />
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <h3 className="font-semibold">Add FAQ</h3>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted-foreground">Parent type</span>
              <select
                value={parentType}
                onChange={(e) => {
                  setParentType(e.target.value as typeof parentType);
                  setParentId("");
                }}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
              >
                <option value="destination">Destination</option>
                <option value="package">Package</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted-foreground">Parent</span>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted-foreground">Question</span>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted-foreground">Answer</span>
              <textarea
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm resize-none"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2 text-sm rounded-md border border-border">
                Cancel
              </button>
              <button
                type="button"
                disabled={addMutation.isPending}
                onClick={() => void handleAdd()}
                className="px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50"
              >
                Add FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </CmsPageShell>
  );
}

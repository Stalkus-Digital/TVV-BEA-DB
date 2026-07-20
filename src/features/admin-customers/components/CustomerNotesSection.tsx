"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCreateCustomerNoteMutation } from "../hooks/useCustomerMutations";
import { fetchCustomerNotes } from "../api/users";
import { formatCustomerDate } from "../utils";
import { adminQueryKeys } from "@/shared/lib/query-client";

interface CustomerNotesSectionProps {
  userId: string;
}

export function CustomerNotesSection({ userId }: CustomerNotesSectionProps) {
  const [body, setBody] = useState("");
  const notesQuery = useQuery({
    queryKey: adminQueryKeys.customers.notes(userId),
    queryFn: () => fetchCustomerNotes(userId),
  });
  const createNote = useCreateCustomerNoteMutation(userId);

  return (
    <section className="space-y-3">
      <h4 className="text-sm font-semibold">Notes</h4>
      <div className="flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note about this customer…"
          className="flex-1 min-h-[72px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
        />
        <button
          type="button"
          disabled={!body.trim() || createNote.isPending}
          onClick={() => {
            createNote.mutate(body.trim(), {
              onSuccess: () => setBody(""),
            });
          }}
          className="self-end rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {notesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading notes…</p>
      ) : !notesQuery.data?.length ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {notesQuery.data.map((note) => (
            <li key={note.id} className="rounded-md border border-border px-3 py-2">
              <p className="whitespace-pre-wrap">{note.body}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatCustomerDate(note.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

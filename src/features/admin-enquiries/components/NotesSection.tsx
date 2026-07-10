"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  useCreateEnquiryNoteMutation,
  useDeleteEnquiryNoteMutation,
  useUpdateEnquiryNoteMutation,
} from "../hooks/useEnquiryMutations";
import { useEnquiryNotesQuery } from "../hooks/useEnquiryNotesQuery";
import { formatEnquiryDate } from "../utils";
import { WidgetEmpty, WidgetError, WidgetLoading } from "@/features/admin-dashboard/components/WidgetState";

interface NotesSectionProps {
  enquiryId: string;
  staffNameById: Map<string, string>;
}

export function NotesSection({ enquiryId, staffNameById }: NotesSectionProps) {
  const notesQuery = useEnquiryNotesQuery(enquiryId);
  const createNote = useCreateEnquiryNoteMutation(enquiryId);
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Internal Notes</h4>

      <div className="flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Add an internal note…"
          className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          disabled={!draft.trim() || createNote.isPending}
          onClick={() => {
            createNote.mutate(draft.trim(), { onSuccess: () => setDraft("") });
          }}
          className="self-end rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium disabled:opacity-60"
        >
          {createNote.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
        </button>
      </div>

      {createNote.isError && (
        <p className="text-xs text-destructive">{createNote.error instanceof Error ? createNote.error.message : "Failed to add note"}</p>
      )}

      {notesQuery.isLoading ? (
        <WidgetLoading />
      ) : notesQuery.isError ? (
        <WidgetError message="Failed to load notes" onRetry={() => void notesQuery.refetch()} />
      ) : !notesQuery.data?.length ? (
        <WidgetEmpty message="No notes yet" />
      ) : (
        <div className="space-y-3">
          {notesQuery.data.map((note) => (
            <NoteItem
              key={note.id}
              enquiryId={enquiryId}
              noteId={note.id}
              body={note.body}
              createdAt={note.createdAt}
              authorLabel={note.authorUserId ? staffNameById.get(note.authorUserId) ?? note.authorUserId : "Unknown"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteItem({
  enquiryId,
  noteId,
  body,
  createdAt,
  authorLabel,
}: {
  enquiryId: string;
  noteId: string;
  body: string;
  createdAt: string;
  authorLabel: string;
}) {
  const updateNote = useUpdateEnquiryNoteMutation(enquiryId);
  const deleteNote = useDeleteEnquiryNoteMutation(enquiryId);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(body);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {authorLabel} · {formatEnquiryDate(createdAt)}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setEditing((value) => !value);
              setEditBody(body);
            }}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
            title="Edit note"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={deleteNote.isPending}
            onClick={() => {
              setIsConfirmingDelete(true);
            }}
            className="p-1 rounded hover:bg-muted text-destructive"
            title="Delete note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!editBody.trim() || updateNote.isPending}
              onClick={() =>
                updateNote.mutate(
                  { noteId, body: editBody.trim() },
                  { onSuccess: () => setEditing(false) }
                )
              }
              className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium disabled:opacity-60"
            >
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-muted-foreground hover:underline">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap">{body}</p>
      )}

      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsConfirmingDelete(false)} aria-label="Cancel" />
          <div className="relative w-full max-w-sm rounded-lg border border-border bg-white dark:bg-slate-900 shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Delete Note</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this note?</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsConfirmingDelete(false)} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteNote.mutate(noteId);
                  setIsConfirmingDelete(false);
                }}
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

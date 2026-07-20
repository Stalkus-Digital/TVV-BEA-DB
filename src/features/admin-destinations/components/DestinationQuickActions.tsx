"use client";

import { Copy, Trash2, Eye, EyeOff } from "lucide-react";

interface DestinationQuickActionsProps {
  destinationId: string;
  status: string;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, currentStatus: string) => void;
  isPending: boolean;
}

export function DestinationQuickActions({
  destinationId,
  status,
  onDuplicate,
  onDelete,
  onTogglePublish,
  isPending,
}: DestinationQuickActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        disabled={isPending}
        onClick={() => onDuplicate(destinationId)}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-50"
        title="Duplicate"
      >
        <Copy className="w-4 h-4" />
      </button>
      <button
        disabled={isPending}
        onClick={() => onTogglePublish(destinationId, status)}
        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-50"
        title={status === "ACTIVE" ? "Unpublish" : "Publish"}
      >
        {status === "ACTIVE" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
      <button
        disabled={isPending}
        onClick={() => onDelete(destinationId)}
        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

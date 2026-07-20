"use client";

import { useEffect } from "react";

export function useKeyboardShortcuts(callbacks: {
  onEscape?: () => void;
  onSearch?: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // ESC to close drawer/dialog
      if (event.key === "Escape" && callbacks.onEscape) {
        callbacks.onEscape();
      }

      // Cmd+K or Ctrl+K to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (callbacks.onSearch) {
          callbacks.onSearch();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callbacks]);
}

import { useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useModeSidebar } from "./use-mode-sidebar";

type ShortcutCallback = () => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: ShortcutCallback;
  description?: string;
}

export const shortcuts: ShortcutConfig[] = [];

export function useKeyboardShortcuts() {
  const [, navigate] = useLocation();
  const { toggle: toggleSidebar } = useModeSidebar();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isInput =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.isContentEditable;

      if (event.key === "Tab" && event.ctrlKey) {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      if (event.key === "Escape" && !isInput) {
        return;
      }

      if (isInput) return;

      if (event.key === "1" && event.altKey) {
        event.preventDefault();
        navigate("/mode/focus");
        return;
      }

      if (event.key === "2" && event.altKey) {
        event.preventDefault();
        navigate("/mode/work");
        return;
      }

      if (event.key === "3" && event.altKey) {
        event.preventDefault();
        navigate("/mode/test");
        return;
      }

      if (event.key === "h" && event.altKey) {
        event.preventDefault();
        navigate("/");
        return;
      }

      if (event.key === "l" && event.altKey) {
        event.preventDefault();
        navigate("/library");
        return;
      }

      if (event.key === "s" && event.altKey) {
        event.preventDefault();
        navigate("/settings");
        return;
      }
    },
    [navigate, toggleSidebar]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function getShortcutsList() {
  return [
    { keys: ["Ctrl", "K"], description: "Open command palette" },
    { keys: ["Ctrl", "Tab"], description: "Toggle mode sidebar" },
    { keys: ["Alt", "1"], description: "Focus Mode" },
    { keys: ["Alt", "2"], description: "Work Mode" },
    { keys: ["Alt", "3"], description: "Test Mode" },
    { keys: ["Alt", "H"], description: "Go Home" },
    { keys: ["Alt", "L"], description: "Go to Library" },
    { keys: ["Alt", "S"], description: "Go to Settings" },
    { keys: ["Esc"], description: "Close dialogs" },
  ];
}

import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  BookOpen,
  FileText,
  Settings,
  Sun,
  Moon,
  Zap,
  GraduationCap,
  Brain,
  ClipboardList,
  Network,
  FlipHorizontal,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [, navigate] = useLocation();
  const { theme, setTheme } = useTheme();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, [setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or jump to..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/library"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Library</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Modes">
          <CommandItem onSelect={() => runCommand(() => navigate("/mode/focus"))}>
            <Zap className="mr-2 h-4 w-4" />
            <span>Focus Mode</span>
            <span className="ml-auto text-xs text-muted-foreground">Read & Ask</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/mode/work"))}>
            <GraduationCap className="mr-2 h-4 w-4" />
            <span>Work Mode</span>
            <span className="ml-auto text-xs text-muted-foreground">Study Tools</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/mode/test"))}>
            <ClipboardList className="mr-2 h-4 w-4" />
            <span>Test Mode</span>
            <span className="ml-auto text-xs text-muted-foreground">Quiz</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Study Tools">
          <CommandItem onSelect={() => runCommand(() => navigate("/@me/content/1/flashcards"))}>
            <FlipHorizontal className="mr-2 h-4 w-4" />
            <span>Flashcards</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/@me/content/1/notes"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Notes</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/@me/content/1/mindmaps"))}>
            <Network className="mr-2 h-4 w-4" />
            <span>Mind Maps</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/@me/content/1/quiz"))}>
            <Brain className="mr-2 h-4 w-4" />
            <span>Quiz</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
            {theme === "light" && <span className="ml-auto text-xs text-primary">Active</span>}
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
            {theme === "dark" && <span className="ml-auto text-xs text-primary">Active</span>}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  return { open, setOpen, toggle: () => setOpen((o) => !o) };
}

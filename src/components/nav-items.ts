import { Sun, CheckSquare, Repeat, FolderKanban, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/routines", label: "Routines", icon: Repeat },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

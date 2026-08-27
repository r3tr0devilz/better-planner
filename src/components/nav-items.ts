import { Sun, CheckSquare, Repeat, FolderKanban, Calendar, Users, BookOpen, Package, Briefcase, Settings } from "lucide-react";

export const PRIMARY_NAV_ITEMS = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/routines", label: "Routines", icon: Repeat },
  { href: "/projects", label: "Projects", icon: FolderKanban },
] as const;

export const SECONDARY_NAV_ITEMS = [
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/people", label: "People", icon: Users },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export const NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS] as const;

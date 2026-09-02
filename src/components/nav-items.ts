import { Sun, CheckSquare, Repeat, FolderKanban, Calendar, Flame, BookOpen, Users, Package, Briefcase, Settings } from "lucide-react";

export const PRIMARY_NAV_ITEMS = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/routines", label: "Routines", icon: Repeat },
  { href: "/projects", label: "Projects", icon: FolderKanban },
] as const;

export const SECONDARY_NAV_ITEMS = [
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/ash", label: "Ash", icon: Flame },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/people", label: "People", icon: Users },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export const NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS] as const;

/** Desktop sidebar reads as a two-part ledger index (roman numerals, not
 * icons) rather than a flat link list — "The day" is what still needs
 * doing, "The record" is what's kept. */
export const NAV_GROUPS = [
  {
    label: "The day",
    items: [
      { href: "/today", label: "Today", icon: Sun },
      { href: "/tasks", label: "Tasks", icon: CheckSquare },
      { href: "/routines", label: "Routines", icon: Repeat },
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    label: "The record",
    items: [
      { href: "/ash", label: "Ash", icon: Flame },
      { href: "/notes", label: "Notes", icon: BookOpen },
      { href: "/library", label: "Library", icon: BookOpen },
      { href: "/people", label: "People", icon: Users },
      { href: "/career", label: "Career", icon: Briefcase },
      { href: "/inventory", label: "Inventory", icon: Package },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

export const NAV_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

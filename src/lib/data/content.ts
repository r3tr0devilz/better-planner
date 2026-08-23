import { createClient } from "@/lib/supabase/server";
import type { ContentItem, Checklist, ChecklistItem } from "@/lib/supabase/types";

export async function getContentItems(): Promise<ContentItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("content_items").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getContentItemDetail(id: string) {
  const supabase = await createClient();

  const [{ data: item, error: itemErr }, { data: checklists, error: clErr }] = await Promise.all([
    supabase.from("content_items").select("*").eq("id", id).single(),
    supabase.from("checklists").select("*").eq("content_item_id", id).order("created_at"),
  ]);
  if (itemErr) throw itemErr;
  if (clErr) throw clErr;

  const checklistIds = (checklists ?? []).map((c) => c.id);
  let checklistItems: ChecklistItem[] = [];
  if (checklistIds.length > 0) {
    const { data, error } = await supabase
      .from("checklist_items")
      .select("*")
      .in("checklist_id", checklistIds)
      .order("sort_order");
    if (error) throw error;
    checklistItems = data;
  }

  return { item: item as ContentItem, checklists: checklists as Checklist[], checklistItems };
}

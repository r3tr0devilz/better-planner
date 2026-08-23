"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ContentItem } from "@/lib/supabase/types";

export async function createContentItem(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const domainId = String(formData.get("domain_id") ?? "") || null;
  const contentType = String(formData.get("content_type") ?? "video");

  const supabase = await createClient();
  const { error } = await supabase.from("content_items").insert({
    title,
    domain_id: domainId,
    content_type: contentType as ContentItem["content_type"],
    status: "idea",
    url: null,
    publish_date: null,
    outline_markdown: null,
  });
  if (error) throw error;

  revalidatePath("/content");
}

export async function updateContentStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("content_items")
    .update({ status: status as ContentItem["status"] })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/content");
  revalidatePath(`/content/${id}`);
}

export async function updateContentDetails(id: string, formData: FormData) {
  const url = String(formData.get("url") ?? "").trim() || null;
  const publishDate = String(formData.get("publish_date") ?? "") || null;
  const outline = String(formData.get("outline_markdown") ?? "");

  const supabase = await createClient();
  const { error } = await supabase
    .from("content_items")
    .update({ url, publish_date: publishDate, outline_markdown: outline })
    .eq("id", id);
  if (error) throw error;

  revalidatePath(`/content/${id}`);
}

export async function createContentChecklist(contentItemId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const templateId = String(formData.get("template_id") ?? "") || null;

  const supabase = await createClient();
  const { data: checklist, error } = await supabase
    .from("checklists")
    .insert({ content_item_id: contentItemId, project_id: null, name })
    .select()
    .single();
  if (error) throw error;

  if (templateId) {
    const { data: templateItems, error: tiErr } = await supabase
      .from("checklist_template_items")
      .select("*")
      .eq("template_id", templateId)
      .order("sort_order");
    if (tiErr) throw tiErr;
    if (templateItems.length > 0) {
      const { error: insErr } = await supabase.from("checklist_items").insert(
        templateItems.map((ti) => ({ checklist_id: checklist.id, text: ti.text, done: false, sort_order: ti.sort_order })),
      );
      if (insErr) throw insErr;
    }
  }

  revalidatePath(`/content/${contentItemId}`);
}

export async function addContentChecklistItem(contentItemId: string, checklistId: string, formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").insert({ checklist_id: checklistId, text, done: false, sort_order: 0 });
  if (error) throw error;

  revalidatePath(`/content/${contentItemId}`);
}

export async function toggleContentChecklistItem(contentItemId: string, itemId: string, done: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").update({ done }).eq("id", itemId);
  if (error) throw error;

  revalidatePath(`/content/${contentItemId}`);
}

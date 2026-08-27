"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createDomain(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const color = String(formData.get("color") ?? "#8c9eff");

  const supabase = await createClient();
  const { error } = await supabase.from("domains").insert({ name, color, icon: null });
  if (error) throw error;

  revalidatePath("/projects");
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const domainId = String(formData.get("domain_id") ?? "") || null;
  const kind = String(formData.get("kind") ?? "project");
  const engagement = String(formData.get("engagement") ?? "project");

  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert({
    name,
    domain_id: domainId,
    kind: kind as "project" | "area",
    engagement: engagement as "project" | "retainer",
    status: "active",
    start_date: null,
    end_date: null,
    hours_logged: 0,
  });
  if (error) throw error;

  revalidatePath("/projects");
}

export async function createMilestone(projectId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("milestones").insert({
    project_id: projectId,
    name,
    percent_complete: 0,
    sort_order: 0,
  });
  if (error) throw error;

  revalidatePath(`/projects/${projectId}`);
}

export async function updateMilestonePercent(projectId: string, milestoneId: string, percent: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("milestones")
    .update({ percent_complete: Math.max(0, Math.min(100, percent)) })
    .eq("id", milestoneId);
  if (error) throw error;

  revalidatePath(`/projects/${projectId}`);
}

export async function createChecklist(projectId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const templateId = String(formData.get("template_id") ?? "") || null;

  const supabase = await createClient();
  const { data: checklist, error } = await supabase
    .from("checklists")
    .insert({ project_id: projectId, content_item_id: null, name })
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
        templateItems.map((item) => ({
          checklist_id: checklist.id,
          text: item.text,
          done: false,
          sort_order: item.sort_order,
        })),
      );
      if (insErr) throw insErr;
    }
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function addChecklistItem(projectId: string, checklistId: string, formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").insert({
    checklist_id: checklistId,
    text,
    done: false,
    sort_order: 0,
  });
  if (error) throw error;

  revalidatePath(`/projects/${projectId}`);
}

export async function toggleChecklistItem(projectId: string, itemId: string, done: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").update({ done }).eq("id", itemId);
  if (error) throw error;

  revalidatePath(`/projects/${projectId}`);
}

export async function createChecklistTemplate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const itemsRaw = String(formData.get("items") ?? "");
  const items = itemsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!name || items.length === 0) return;

  const supabase = await createClient();
  const { data: template, error } = await supabase
    .from("checklist_templates")
    .insert({ name })
    .select()
    .single();
  if (error) throw error;

  const { error: insErr } = await supabase.from("checklist_template_items").insert(
    items.map((text, i) => ({ template_id: template.id, text, sort_order: i })),
  );
  if (insErr) throw insErr;

  revalidatePath("/projects");
}

export async function logActivity(projectId: string, formData: FormData) {
  const minutes = Number(formData.get("minutes") ?? 0);
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!minutes) return;

  const supabase = await createClient();
  const { error: logErr } = await supabase.from("activity_logs").insert({
    project_id: projectId,
    note,
    minutes,
  });
  if (logErr) throw logErr;

  const { data: project, error: projErr } = await supabase
    .from("projects")
    .select("hours_logged")
    .eq("id", projectId)
    .single();
  if (projErr) throw projErr;

  const { error: updErr } = await supabase
    .from("projects")
    .update({ hours_logged: Number(project.hours_logged) + minutes / 60 })
    .eq("id", projectId);
  if (updErr) throw updErr;

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;

  revalidatePath("/projects");
}

export async function deleteProjectRedirect(projectId: string) {
  await deleteProject(projectId);
  redirect("/projects");
}

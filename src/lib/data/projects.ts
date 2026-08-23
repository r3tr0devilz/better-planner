import { createClient } from "@/lib/supabase/server";
import type {
  Project,
  Milestone,
  Checklist,
  ChecklistItem,
  ChecklistTemplate,
  ActivityLog,
} from "@/lib/supabase/types";

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getChecklistTemplates(): Promise<ChecklistTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("checklist_templates").select("*").order("name");
  if (error) throw error;
  return data;
}

const SLIPPING_DAYS = 7;

/** Active projects/areas with no logged activity in the last SLIPPING_DAYS days. */
export async function getSlippingProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - SLIPPING_DAYS);

  const [{ data: projects, error: pErr }, { data: logs, error: lErr }] = await Promise.all([
    supabase.from("projects").select("*").eq("status", "active"),
    supabase.from("activity_logs").select("project_id, logged_at"),
  ]);
  if (pErr) throw pErr;
  if (lErr) throw lErr;

  const lastTouched = new Map<string, string>();
  for (const log of logs) {
    const prev = lastTouched.get(log.project_id);
    if (!prev || log.logged_at > prev) lastTouched.set(log.project_id, log.logged_at);
  }

  return (projects as Project[]).filter((p) => {
    const touched = lastTouched.get(p.id) ?? p.created_at;
    return new Date(touched) < cutoff;
  });
}

export async function getProjectDetail(id: string) {
  const supabase = await createClient();

  const [{ data: project, error: projectErr }, { data: milestones, error: msErr }, { data: checklists, error: clErr }, { data: activityLogs, error: alErr }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("milestones").select("*").eq("project_id", id).order("sort_order"),
      supabase.from("checklists").select("*").eq("project_id", id).order("created_at"),
      supabase.from("activity_logs").select("*").eq("project_id", id).order("logged_at", { ascending: false }),
    ]);

  if (projectErr) throw projectErr;
  if (msErr) throw msErr;
  if (clErr) throw clErr;
  if (alErr) throw alErr;

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

  return {
    project: project as Project,
    milestones: milestones as Milestone[],
    checklists: checklists as Checklist[],
    checklistItems,
    activityLogs: activityLogs as ActivityLog[],
  };
}

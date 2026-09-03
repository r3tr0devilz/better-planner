import type { createClient } from "@/lib/supabase/server";
import type { Domain } from "@/lib/supabase/types";
import type { CaptureResult } from "./schema";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Writes one parsed capture result to whichever table its `kind` maps to,
 * and returns the notification label. Shared by the single-item capture
 * route and the AI-capture batch commit route — extracted from the
 * original single-item route so both write through the exact same
 * kind-to-table logic instead of drifting apart. */
export async function insertCaptureResult(supabase: Supabase, domains: Domain[], parsed: CaptureResult): Promise<string> {
  const domain = domains.find((d) => d.name.toLowerCase() === parsed.domain_name?.toLowerCase());

  if (parsed.kind === "task") {
    const reminderAt =
      parsed.due_at && parsed.reminder_minutes_before
        ? new Date(new Date(parsed.due_at).getTime() - parsed.reminder_minutes_before * 60_000).toISOString()
        : null;

    const { error } = await supabase.from("tasks").insert({
      title: parsed.title,
      domain_id: domain?.id ?? null,
      project_id: null,
      content_item_id: null,
      notes: null,
      due_at: parsed.due_at,
      reminder_at: reminderAt,
      priority: parsed.priority,
      status: "open",
      is_top_three: false,
      recurring_rule: null,
      duration_minutes: null,
      state_id: null,
    });
    if (error) throw error;
    return `Task created: ${parsed.title}`;
  }

  if (parsed.kind === "job_application") {
    const { error } = await supabase.from("job_applications").insert({
      company: parsed.company ?? parsed.title,
      role: parsed.role ?? parsed.title,
      status: parsed.application_status ?? "saved",
      deadline: parsed.due_at,
      job_link: parsed.job_link,
      resume_version: null,
      notes: null,
      next_follow_up: null,
      sort_order: 0,
    });
    if (error) throw error;
    return `Application saved: ${parsed.company ?? parsed.title}`;
  }

  if (parsed.kind === "course") {
    const { error } = await supabase.from("courses").insert({
      name: parsed.title,
      platform: parsed.course_platform,
      status: "not_started",
      progress_percent: 0,
      deadline: parsed.due_at,
      next_lesson: null,
      notes: null,
      course_link: parsed.course_link,
    });
    if (error) throw error;
    return `Course saved: ${parsed.title}`;
  }

  if (parsed.kind === "certificate") {
    const { error } = await supabase.from("certificates").insert({
      title: parsed.title,
      issuer: parsed.issuer,
      earned_date: null,
      expiry_date: null,
      credential_link: parsed.credential_link,
      file_link: null,
      related_skills: [],
    });
    if (error) throw error;
    return `Certificate saved: ${parsed.title}`;
  }

  if (parsed.kind === "career_contact") {
    const { error } = await supabase.from("career_contacts").insert({
      name: parsed.title,
      relationship_type: parsed.relationship_type ?? "contact",
      company: parsed.company,
      last_contacted: null,
      next_follow_up: parsed.due_at,
      notes: null,
    });
    if (error) throw error;
    return `Contact saved: ${parsed.title}`;
  }

  return `Captured: ${parsed.title}`;
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { JobApplication } from "@/lib/supabase/types";

export async function createJobApplication(formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  if (!company || !role) return;

  const deadline = String(formData.get("deadline") ?? "") || null;
  const jobLink = String(formData.get("job_link") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("job_applications").insert({
    company,
    role,
    status: "saved",
    deadline,
    job_link: jobLink,
    resume_version: null,
    notes: null,
    next_follow_up: null,
    sort_order: 0,
  });
  if (error) throw error;

  revalidatePath("/career");
}

/**
 * Kanban drop: `movedId` lands in `status`, and `orderedIds` is the full,
 * final card order for that column (including movedId) — simplest correct
 * way to persist drag-and-drop reordering without fractional sort_order math.
 */
export async function moveJobApplication(movedId: string, status: JobApplication["status"], orderedIds: string[]) {
  const supabase = await createClient();

  const { error: statusErr } = await supabase.from("job_applications").update({ status }).eq("id", movedId);
  if (statusErr) throw statusErr;

  await Promise.all(
    orderedIds.map((id, i) => supabase.from("job_applications").update({ sort_order: i * 10 }).eq("id", id)),
  );

  revalidatePath("/career");
}

export async function updateJobApplication(id: string, formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  if (!company || !role) return;

  const deadline = String(formData.get("deadline") ?? "") || null;
  const jobLink = String(formData.get("job_link") ?? "").trim() || null;
  // Optional: the Kanban board's edit modal never had a status field (status
  // only moved via drag between columns), but the row3 list replacing it
  // needs one now that dragging is gone. Falls back to leaving status
  // untouched so the Kanban-era modal (no status field in its FormData)
  // still works unchanged.
  const statusRaw = formData.get("status");
  const status = typeof statusRaw === "string" && statusRaw ? (statusRaw as JobApplication["status"]) : undefined;

  const supabase = await createClient();
  const { error } = await supabase
    .from("job_applications")
    .update({ company, role, deadline, job_link: jobLink, ...(status ? { status } : {}) })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/career");
}

export async function deleteJobApplication(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("job_applications").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/career");
}

export async function createCourse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const platform = String(formData.get("platform") ?? "").trim() || null;
  const deadline = String(formData.get("deadline") ?? "") || null;
  const courseLink = String(formData.get("course_link") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("courses").insert({
    name,
    platform,
    status: "not_started",
    progress_percent: 0,
    deadline,
    next_lesson: null,
    notes: null,
    course_link: courseLink,
  });
  if (error) throw error;

  revalidatePath("/career");
}

export async function updateCourseProgress(id: string, percent: number) {
  const clamped = Math.max(0, Math.min(100, percent));
  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({
      progress_percent: clamped,
      status: clamped >= 100 ? "completed" : clamped > 0 ? "in_progress" : "not_started",
    })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/career");
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/career");
}

export async function createCertificate(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const issuer = String(formData.get("issuer") ?? "").trim() || null;
  const earnedDate = String(formData.get("earned_date") ?? "") || null;
  const credentialLink = String(formData.get("credential_link") ?? "").trim() || null;
  const skillsRaw = String(formData.get("related_skills") ?? "");
  const relatedSkills = skillsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const supabase = await createClient();
  const { error } = await supabase.from("certificates").insert({
    title,
    issuer,
    earned_date: earnedDate,
    expiry_date: null,
    credential_link: credentialLink,
    file_link: null,
    related_skills: relatedSkills,
  });
  if (error) throw error;

  revalidatePath("/career");
}

export async function deleteCertificate(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("certificates").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/career");
}

export async function createCareerContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const relationshipType = String(formData.get("relationship_type") ?? "contact");
  const company = String(formData.get("company") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("career_contacts").insert({
    name,
    relationship_type: relationshipType as "recruiter" | "mentor" | "referral" | "company_contact" | "contact",
    company,
    last_contacted: null,
    next_follow_up: null,
    notes: null,
  });
  if (error) throw error;

  revalidatePath("/career");
}

export async function updateCareerContact(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const relationshipType = String(formData.get("relationship_type") ?? "contact");
  const company = String(formData.get("company") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("career_contacts")
    .update({
      name,
      relationship_type: relationshipType as "recruiter" | "mentor" | "referral" | "company_contact" | "contact",
      company,
    })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/career");
}

export async function deleteCareerContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("career_contacts").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/career");
}

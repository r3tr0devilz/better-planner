import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDomains } from "@/lib/data/domains";
import { getCaptureSettings } from "@/lib/data/settings";
import { parseCapture } from "@/lib/capture/parse";

export async function POST(request: Request) {
  try {
    return await handleCapture(request);
  } catch (err) {
    // Anything thrown here (a bad Supabase insert, a parse-provider error, a
    // malformed LLM response) used to crash the whole request with no
    // response at all — the client's fetch would just fail. Always answer
    // with JSON so the capture bar's own error state can show instead.
    console.error("capture failed:", err);
    return NextResponse.json({ error: "capture failed" }, { status: 500 });
  }
}

async function handleCapture(request: Request) {
  const { text, source } = (await request.json()) as { text: string; source: "text" | "voice" };
  if (!text?.trim()) {
    return NextResponse.json({ error: "empty capture" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [domains, captureSettings] = await Promise.all([getDomains(), getCaptureSettings()]);

  const { data: inbox, error: inboxErr } = await supabase
    .from("capture_inbox")
    .insert({ raw_text: text, source, parsed_result: null })
    .select()
    .single();
  if (inboxErr) throw inboxErr;

  const parsed = await parseCapture(text, domains, captureSettings);
  if (!parsed) {
    return NextResponse.json({ error: "could not parse capture" }, { status: 502 });
  }

  const domain = domains.find((d) => d.name.toLowerCase() === parsed.domain_name?.toLowerCase());
  let label = parsed.title;

  if (parsed.kind === "task") {
    const reminderAt =
      parsed.due_at && parsed.reminder_minutes_before
        ? new Date(new Date(parsed.due_at).getTime() - parsed.reminder_minutes_before * 60_000).toISOString()
        : null;

    const { error: taskErr } = await supabase.from("tasks").insert({
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
    });
    if (taskErr) throw taskErr;
    label = `Task created: ${parsed.title}`;
  } else if (parsed.kind === "job_application") {
    const { error: appErr } = await supabase.from("job_applications").insert({
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
    if (appErr) throw appErr;
    label = `Application saved: ${parsed.company ?? parsed.title}`;
  } else if (parsed.kind === "course") {
    const { error: courseErr } = await supabase.from("courses").insert({
      name: parsed.title,
      platform: parsed.course_platform,
      status: "not_started",
      progress_percent: 0,
      deadline: parsed.due_at,
      next_lesson: null,
      notes: null,
      course_link: parsed.course_link,
    });
    if (courseErr) throw courseErr;
    label = `Course saved: ${parsed.title}`;
  } else if (parsed.kind === "certificate") {
    const { error: certErr } = await supabase.from("certificates").insert({
      title: parsed.title,
      issuer: parsed.issuer,
      earned_date: null,
      expiry_date: null,
      credential_link: parsed.credential_link,
      file_link: null,
      related_skills: [],
    });
    if (certErr) throw certErr;
    label = `Certificate saved: ${parsed.title}`;
  } else if (parsed.kind === "career_contact") {
    const { error: contactErr } = await supabase.from("career_contacts").insert({
      name: parsed.title,
      relationship_type: parsed.relationship_type ?? "contact",
      company: parsed.company,
      last_contacted: null,
      next_follow_up: parsed.due_at,
      notes: null,
    });
    if (contactErr) throw contactErr;
    label = `Contact saved: ${parsed.title}`;
  } else {
    label = `Captured: ${parsed.title}`;
  }

  await supabase.from("capture_inbox").update({ parsed_result: parsed }).eq("id", inbox.id);
  await supabase.from("notifications").insert({ kind: "capture", message: label, read: false });

  return NextResponse.json({ label });
}

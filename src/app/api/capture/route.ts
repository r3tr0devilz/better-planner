import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDomains } from "@/lib/data/domains";
import { getCaptureSettings } from "@/lib/data/settings";
import { parseCapture } from "@/lib/capture/parse";
import { insertCaptureResult } from "@/lib/capture/insert";

// Free-tier OpenRouter models can take well past Vercel's default serverless
// timeout to respond, especially under shared-pool load — the request gets
// killed mid-flight (502) instead of reaching parseCapture's own error
// handling. 60s is the max allowed on Hobby without Fluid Compute.
export const maxDuration = 60;

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

  const label = await insertCaptureResult(supabase, domains, parsed);

  await supabase.from("capture_inbox").update({ parsed_result: parsed }).eq("id", inbox.id);
  await supabase.from("notifications").insert({ kind: "capture", message: label, read: false });

  return NextResponse.json({ label });
}

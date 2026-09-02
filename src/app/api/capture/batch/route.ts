import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDomains } from "@/lib/data/domains";
import { getCaptureSettings } from "@/lib/data/settings";
import { parseCaptureBatch } from "@/lib/capture/parse";

// See src/app/api/capture/route.ts — same reasoning (slow free-tier models
// can outrun Vercel's default serverless timeout).
export const maxDuration = 60;

/** AI capture's "Read it" step: parses text into candidate records for
 * review, but writes nothing — commit (./commit/route.ts) does that once
 * the user has picked which ones to keep. */
export async function POST(request: Request) {
  try {
    const { text } = (await request.json()) as { text: string };
    if (!text?.trim()) {
      return NextResponse.json({ error: "empty capture" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const [domains, captureSettings] = await Promise.all([getDomains(), getCaptureSettings()]);
    const items = await parseCaptureBatch(text, domains, captureSettings);

    return NextResponse.json({ items });
  } catch (err) {
    console.error("batch capture failed:", err);
    return NextResponse.json({ error: "capture failed" }, { status: 500 });
  }
}

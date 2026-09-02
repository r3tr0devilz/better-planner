import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDomains } from "@/lib/data/domains";
import { insertCaptureResult } from "@/lib/capture/insert";
import { CaptureSchema } from "@/lib/capture/schema";

export const maxDuration = 60;

/** AI capture's "Cut N slips" step — writes the items the user kept after
 * reviewing the batch preview. Re-validates every item against
 * CaptureSchema server-side rather than trusting the client-echoed array
 * as-is: the review step lets the user uncheck/reorder, but the item
 * shapes themselves came from an LLM response the client only round-trips. */
export async function POST(request: Request) {
  try {
    const { text, items: rawItems } = (await request.json()) as { text: string; items: unknown[] };
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: "no items" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const items = rawItems.map((raw) => CaptureSchema.safeParse(raw)).filter((r) => r.success).map((r) => r.data);
    if (items.length === 0) {
      return NextResponse.json({ error: "no valid items" }, { status: 400 });
    }

    const domains = await getDomains();

    const { data: inbox } = await supabase
      .from("capture_inbox")
      .insert({ raw_text: text ?? "", source: "text", parsed_result: { items } })
      .select()
      .single();

    const labels = await Promise.all(items.map((item) => insertCaptureResult(supabase, domains, item)));

    if (inbox) {
      await supabase.from("capture_inbox").update({ parsed_result: { items, labels } }).eq("id", inbox.id);
    }
    await supabase.from("notifications").insert({
      kind: "capture",
      message: items.length === 1 ? labels[0] : `Captured ${items.length} items from text`,
      read: false,
    });

    return NextResponse.json({ count: items.length, labels });
  } catch (err) {
    console.error("batch capture commit failed:", err);
    return NextResponse.json({ error: "commit failed" }, { status: 500 });
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayStr } from "@/lib/data/routines";

export async function createRoutine(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const timeOfDay = String(formData.get("time_of_day") ?? "anytime");
  const mode = String(formData.get("mode") ?? "ongoing");
  const totalDaysRaw = String(formData.get("total_days") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.from("routines").insert({
    name,
    description: null,
    time_of_day: timeOfDay as "morning" | "afternoon" | "evening" | "anytime",
    specific_time: null,
    notify: false,
    mode: mode as "ongoing" | "fixed_days",
    total_days: mode === "fixed_days" && totalDaysRaw ? Number(totalDaysRaw) : null,
    start_date: todayStr(),
    archived: false,
  });
  if (error) throw error;

  revalidatePath("/routines");
  revalidatePath("/today");
}

export async function setCompletion(routineId: string, date: string, completed: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("routine_completions")
    .upsert({ routine_id: routineId, date, completed }, { onConflict: "routine_id,date" });
  if (error) throw error;

  revalidatePath("/routines");
  revalidatePath("/today");
}

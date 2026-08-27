"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPerson(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const birthday = String(formData.get("birthday") ?? "") || null;

  const supabase = await createClient();
  const { error } = await supabase.from("people").insert({ name, birthday, anniversary: null });
  if (error) throw error;

  revalidatePath("/people");
}

export async function addFact(personId: string, formData: FormData) {
  const fact = String(formData.get("fact") ?? "").trim();
  if (!fact) return;

  const supabase = await createClient();
  const { error } = await supabase.from("people_facts").insert({ person_id: personId, fact });
  if (error) throw error;

  revalidatePath(`/people/${personId}`);
}

export async function addInteraction(personId: string, formData: FormData) {
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return;

  const supabase = await createClient();
  const { error } = await supabase.from("people_interactions").insert({ person_id: personId, note });
  if (error) throw error;

  revalidatePath(`/people/${personId}`);
}

export async function updatePerson(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const birthday = String(formData.get("birthday") ?? "") || null;

  const supabase = await createClient();
  const { error } = await supabase.from("people").update({ name, birthday }).eq("id", id);
  if (error) throw error;

  revalidatePath(`/people/${id}`);
  revalidatePath("/people");
}

export async function deletePerson(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("people").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/people");
  redirect("/people");
}

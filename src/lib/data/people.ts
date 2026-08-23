import { createClient } from "@/lib/supabase/server";
import type { Person, PersonFact, PersonInteraction } from "@/lib/supabase/types";

export async function getPeople(): Promise<Person[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("people").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getPersonDetail(id: string) {
  const supabase = await createClient();

  const [{ data: person, error: pErr }, { data: facts, error: fErr }, { data: interactions, error: iErr }] = await Promise.all([
    supabase.from("people").select("*").eq("id", id).single(),
    supabase.from("people_facts").select("*").eq("person_id", id).order("created_at", { ascending: false }),
    supabase.from("people_interactions").select("*").eq("person_id", id).order("occurred_at", { ascending: false }),
  ]);
  if (pErr) throw pErr;
  if (fErr) throw fErr;
  if (iErr) throw iErr;

  return {
    person: person as Person,
    facts: facts as PersonFact[],
    interactions: interactions as PersonInteraction[],
  };
}

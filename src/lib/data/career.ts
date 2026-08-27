import { createClient } from "@/lib/supabase/server";
import type { JobApplication, Course, Certificate, CareerContact } from "@/lib/supabase/types";

export async function getJobApplications(): Promise<JobApplication[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("job_applications").select("*").order("sort_order");
  if (error) throw error;
  return data;
}

export async function getCourses(): Promise<Course[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCertificates(): Promise<Certificate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("certificates").select("*").order("earned_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCareerContacts(): Promise<CareerContact[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("career_contacts").select("*").order("next_follow_up");
  if (error) throw error;
  return data;
}

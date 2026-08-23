import { createClient } from "@/lib/supabase/server";
import type { LibraryNote, Book, Highlight, HighlightThought } from "@/lib/supabase/types";

export async function getLibraryNotes(): Promise<LibraryNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("library_notes").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBooks(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBookDetail(id: string) {
  const supabase = await createClient();

  const [{ data: book, error: bErr }, { data: highlights, error: hErr }] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).single(),
    supabase.from("highlights").select("*").eq("book_id", id).order("created_at"),
  ]);
  if (bErr) throw bErr;
  if (hErr) throw hErr;

  const highlightIds = (highlights ?? []).map((h) => h.id);
  let thoughts: HighlightThought[] = [];
  if (highlightIds.length > 0) {
    const { data, error } = await supabase
      .from("highlight_thoughts")
      .select("*")
      .in("highlight_id", highlightIds)
      .order("created_at");
    if (error) throw error;
    thoughts = data;
  }

  return { book: book as Book, highlights: highlights as Highlight[], thoughts };
}

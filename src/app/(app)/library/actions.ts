"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LibraryNote, Book } from "@/lib/supabase/types";

export async function createNote(formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const kind = String(formData.get("kind") ?? "note") as LibraryNote["kind"];
  const source = String(formData.get("source") ?? "").trim() || null;
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const supabase = await createClient();
  const { error } = await supabase.from("library_notes").insert({
    kind,
    source,
    body,
    tags,
    image_url: null,
    flagged_for_review: false,
    book_id: null,
  });
  if (error) throw error;

  revalidatePath("/library");
}

export async function toggleNoteFlag(id: string, flagged: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("library_notes").update({ flagged_for_review: flagged }).eq("id", id);
  if (error) throw error;

  revalidatePath("/library");
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("library_notes").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/library");
}

export async function createBook(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const author = String(formData.get("author") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("books").insert({
    title,
    author,
    cover_url: null,
    status: "want",
    format: null,
    started_at: null,
    finished_at: null,
    rating: null,
    isbn: null,
  });
  if (error) throw error;

  revalidatePath("/library");
}

export async function updateBookStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("books").update({ status: status as Book["status"] }).eq("id", id);
  if (error) throw error;

  revalidatePath("/library");
  revalidatePath(`/library/books/${id}`);
}

export async function deleteBookInPlace(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/library");
}

export async function createHighlight(bookId: string, formData: FormData) {
  const quote = String(formData.get("quote") ?? "").trim();
  if (!quote) return;

  const supabase = await createClient();
  const { error } = await supabase.from("highlights").insert({ book_id: bookId, quote });
  if (error) throw error;

  revalidatePath(`/library/books/${bookId}`);
}

export async function deleteHighlight(bookId: string, id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("highlights").delete().eq("id", id);
  if (error) throw error;

  revalidatePath(`/library/books/${bookId}`);
}

export async function addThought(bookId: string, highlightId: string, formData: FormData) {
  const thought = String(formData.get("thought") ?? "").trim();
  if (!thought) return;

  const supabase = await createClient();
  const { error } = await supabase.from("highlight_thoughts").insert({ highlight_id: highlightId, thought });
  if (error) throw error;

  revalidatePath(`/library/books/${bookId}`);
}

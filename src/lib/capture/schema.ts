import { z } from "zod";

export const CaptureSchema = z.object({
  kind: z.enum(["task", "other"]),
  title: z.string().describe("Cleaned-up title — no filler words, no 'um's, rewritten as a clear action item"),
  domain_name: z.string().nullable().describe("Best-matching existing domain name, or null if none fits"),
  due_at: z.string().nullable().describe("ISO 8601 datetime if a due date/time was mentioned, else null"),
  reminder_minutes_before: z.number().nullable().describe("Minutes before due_at to remind, else null"),
  priority: z.enum(["low", "medium", "high"]),
});

export type CaptureResult = z.infer<typeof CaptureSchema>;

import { z } from "zod";

export const CaptureSchema = z.object({
  kind: z.enum(["task", "job_application", "course", "certificate", "career_contact", "other"]),
  title: z
    .string()
    .describe(
      "Cleaned-up title — no filler words, no 'um's, rewritten as a clear action item for kind=task, or a short label (role, course name, certificate title, contact name) for the other kinds",
    ),
  domain_name: z.string().nullable().describe("Best-matching existing domain name, or null if none fits"),
  due_at: z
    .string()
    .nullable()
    .describe(
      "ISO 8601 datetime/date if one was mentioned: a task's due date, a job/course deadline, or a contact's next follow-up. Else null.",
    ),
  reminder_minutes_before: z.number().nullable().describe("Minutes before due_at to remind, else null (kind=task only)"),
  priority: z.enum(["low", "medium", "high"]),

  // kind=job_application
  company: z.string().nullable().describe("Company name (kind=job_application or kind=career_contact)"),
  role: z.string().nullable().describe("Job role/title being applied for (kind=job_application)"),
  application_status: z
    .enum(["saved", "applied", "interviewing", "offer", "rejected"])
    .nullable()
    .describe("Application stage implied by the note, e.g. 'applied to' → applied (kind=job_application)"),
  job_link: z.string().nullable().describe("Job posting URL, if mentioned (kind=job_application)"),

  // kind=course
  course_platform: z.string().nullable().describe("Course platform, e.g. Coursera, Udemy (kind=course)"),
  course_link: z.string().nullable().describe("Course URL, if mentioned (kind=course)"),

  // kind=certificate
  issuer: z.string().nullable().describe("Certificate issuer/organization (kind=certificate)"),
  credential_link: z.string().nullable().describe("Credential/certificate URL, if mentioned (kind=certificate)"),

  // kind=career_contact
  relationship_type: z
    .enum(["recruiter", "mentor", "referral", "company_contact", "contact"])
    .nullable()
    .describe("Relationship type (kind=career_contact)"),
});

export type CaptureResult = z.infer<typeof CaptureSchema>;

/** Wrapped in an object (not a bare top-level array) because Anthropic's
 * schema-constrained output and most providers' JSON-object modes expect an
 * object at the root — a bare array is the less broadly supported shape. */
export const CaptureBatchSchema = z.object({
  items: z
    .array(CaptureSchema)
    .max(8)
    .describe("One entry per distinct actionable item found in the text, up to 8. Empty array if none."),
});

export type CaptureBatchResult = z.infer<typeof CaptureBatchSchema>;

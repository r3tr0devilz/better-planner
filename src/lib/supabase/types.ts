// Hand-written to match supabase/migrations/0001_init.sql. Only the tables
// used by the modules built so far are typed here — extend as each later
// phase's tables come online, rather than typing ahead of the UI.

type Timestamped = {
  created_at: string;
};

export type Domain = Timestamped & {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
};

export type Project = Timestamped & {
  id: string;
  user_id: string;
  domain_id: string | null;
  name: string;
  kind: "project" | "area";
  engagement: "project" | "retainer";
  status: string;
  start_date: string | null;
  end_date: string | null;
  hours_logged: number;
};

export type Milestone = Timestamped & {
  id: string;
  user_id: string;
  project_id: string;
  name: string;
  percent_complete: number;
  sort_order: number;
};

export type ChecklistTemplate = Timestamped & {
  id: string;
  user_id: string;
  name: string;
};

export type ChecklistTemplateItem = {
  id: string;
  user_id: string;
  template_id: string;
  text: string;
  sort_order: number;
};

export type Checklist = Timestamped & {
  id: string;
  user_id: string;
  project_id: string | null;
  content_item_id: string | null;
  name: string;
};

export type ChecklistItem = {
  id: string;
  user_id: string;
  checklist_id: string;
  text: string;
  done: boolean;
  sort_order: number;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  project_id: string;
  note: string | null;
  minutes: number;
  logged_at: string;
};

export type Task = Timestamped & {
  id: string;
  user_id: string;
  domain_id: string | null;
  project_id: string | null;
  content_item_id: string | null;
  title: string;
  notes: string | null;
  due_at: string | null;
  reminder_at: string | null;
  priority: "low" | "medium" | "high";
  status: "open" | "done";
  is_top_three: boolean;
  recurring_rule: string | null;
};

export type Routine = Timestamped & {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  time_of_day: "morning" | "afternoon" | "evening" | "anytime";
  specific_time: string | null;
  notify: boolean;
  mode: "ongoing" | "fixed_days";
  total_days: number | null;
  start_date: string;
  archived: boolean;
};

export type RoutineCompletion = {
  id: string;
  user_id: string;
  routine_id: string;
  date: string;
  completed: boolean;
};

export type CaptureInbox = Timestamped & {
  id: string;
  user_id: string;
  raw_text: string;
  source: "text" | "voice";
  parsed_result: Record<string, unknown> | null;
};

export type NotificationRow = Timestamped & {
  id: string;
  user_id: string;
  kind: string;
  message: string;
  read: boolean;
};

export type ContentItem = Timestamped & {
  id: string;
  user_id: string;
  domain_id: string | null;
  title: string;
  content_type: "video" | "article" | "podcast" | "newsletter";
  status: "idea" | "outlining" | "editing" | "waiting" | "published";
  url: string | null;
  publish_date: string | null;
  outline_markdown: string | null;
};

export type Person = Timestamped & {
  id: string;
  user_id: string;
  name: string;
  birthday: string | null;
  anniversary: string | null;
};

export type PersonFact = Timestamped & {
  id: string;
  user_id: string;
  person_id: string;
  fact: string;
};

export type PersonInteraction = {
  id: string;
  user_id: string;
  person_id: string;
  occurred_at: string;
  note: string | null;
};

export type Book = Timestamped & {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  status: "want" | "reading" | "finished" | "abandoned";
  format: string | null;
  started_at: string | null;
  finished_at: string | null;
  rating: number | null;
  isbn: string | null;
};

export type LibraryNote = Timestamped & {
  id: string;
  user_id: string;
  kind: "note" | "quote" | "journal";
  source: string | null;
  body: string;
  tags: string[];
  image_url: string | null;
  flagged_for_review: boolean;
  book_id: string | null;
};

export type Highlight = Timestamped & {
  id: string;
  user_id: string;
  book_id: string;
  quote: string;
};

export type HighlightThought = Timestamped & {
  id: string;
  user_id: string;
  highlight_id: string;
  thought: string;
};

export type InventoryItem = {
  id: string;
  user_id: string;
  name: string;
  photo_url: string | null;
  location: string | null;
  added_at: string;
  removed_at: string | null;
};

type TableDef<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      domains: TableDef<Domain, Omit<Domain, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      projects: TableDef<Project, Omit<Project, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      milestones: TableDef<Milestone, Omit<Milestone, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      checklist_templates: TableDef<ChecklistTemplate, Omit<ChecklistTemplate, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      checklist_template_items: TableDef<ChecklistTemplateItem, Omit<ChecklistTemplateItem, "id" | "user_id"> & { user_id?: string }>;
      checklists: TableDef<Checklist, Omit<Checklist, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      checklist_items: TableDef<ChecklistItem, Omit<ChecklistItem, "id" | "user_id"> & { user_id?: string }>;
      activity_logs: TableDef<ActivityLog, Omit<ActivityLog, "id" | "user_id" | "logged_at"> & { user_id?: string; logged_at?: string }>;
      tasks: TableDef<Task, Omit<Task, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      routines: TableDef<Routine, Omit<Routine, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      routine_completions: TableDef<RoutineCompletion, Omit<RoutineCompletion, "id" | "user_id"> & { user_id?: string }>;
      capture_inbox: TableDef<CaptureInbox, Omit<CaptureInbox, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      notifications: TableDef<NotificationRow, Omit<NotificationRow, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      content_items: TableDef<ContentItem, Omit<ContentItem, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      people: TableDef<Person, Omit<Person, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      people_facts: TableDef<PersonFact, Omit<PersonFact, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      people_interactions: TableDef<PersonInteraction, Omit<PersonInteraction, "id" | "user_id" | "occurred_at"> & { user_id?: string; occurred_at?: string }>;
      books: TableDef<Book, Omit<Book, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      library_notes: TableDef<LibraryNote, Omit<LibraryNote, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      highlights: TableDef<Highlight, Omit<Highlight, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      highlight_thoughts: TableDef<HighlightThought, Omit<HighlightThought, "id" | "user_id" | "created_at"> & { user_id?: string }>;
      inventory_items: TableDef<InventoryItem, Omit<InventoryItem, "id" | "user_id" | "added_at"> & { user_id?: string; added_at?: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

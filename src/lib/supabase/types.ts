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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

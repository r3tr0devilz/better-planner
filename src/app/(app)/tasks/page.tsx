import { getTasks } from "@/lib/data/tasks";
import { getDomains } from "@/lib/data/domains";
import { PageHeader } from "@/components/page-header";
import { CollapsibleForm } from "@/components/collapsible-form";
import { SubmitButton } from "@/components/submit-button";
import { TaskList } from "./task-list";
import { createTask } from "./actions";

export default async function TasksPage() {
  const [tasks, domains] = await Promise.all([getTasks(), getDomains()]);
  const open = tasks.filter((t) => t.status === "open");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Tasks" context={`${open.length} open, ${done.length} done`} />

      <CollapsibleForm action={createTask} triggerLabel="New task">
        <label className="field-wide">
          New task
          <input name="title" required placeholder="What needs doing?" className="field" />
        </label>
        <label>
          Domain
          <select name="domain_id" className="field">
            <option value="">None</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Due
          <input type="datetime-local" name="due_at" className="field" />
        </label>
        <label>
          Priority
          <select name="priority" defaultValue="medium" className="field">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <SubmitButton>Add</SubmitButton>
      </CollapsibleForm>

      <TaskList tasks={tasks} domains={domains} />
    </div>
  );
}

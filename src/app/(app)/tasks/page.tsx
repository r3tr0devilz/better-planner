import { getTasks } from "@/lib/data/tasks";
import { getDomains, threadIndexFor } from "@/lib/data/domains";
import { TaskRow } from "@/components/task-row";
import { PageHeader } from "@/components/page-header";
import { createTask } from "./actions";

export default async function TasksPage() {
  const [tasks, domains] = await Promise.all([getTasks(), getDomains()]);
  const open = tasks.filter((t) => t.status === "open");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Tasks" context={`${open.length} open, ${done.length} done`} />

      <form action={createTask} className="field-row card mt-6 p-4">
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
        <button type="submit" className="btn">
          Add
        </button>
      </form>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Open ({open.length})</h2>
        <div className="ledger mt-3">
          {open.length === 0 && <p className="py-3 text-sm text-ink-faint">Nothing open. Add something above.</p>}
          {open.map((task) => (
            <TaskRow key={task.id} task={task} threadIndex={threadIndexFor(task.domain_id, domains)} domains={domains} />
          ))}
        </div>
      </section>

      {done.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink-faint">Done ({done.length})</h2>
          <div className="ledger mt-3">
            {done.map((task) => (
              <TaskRow key={task.id} task={task} threadIndex={threadIndexFor(task.domain_id, domains)} domains={domains} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { getTasks } from "@/lib/data/tasks";
import { getDomains, threadIndexFor } from "@/lib/data/domains";
import { TaskRow } from "@/components/task-row";
import { createTask } from "./actions";

export default async function TasksPage() {
  const [tasks, domains] = await Promise.all([getTasks(), getDomains()]);
  const open = tasks.filter((t) => t.status === "open");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-mist">Tasks</h1>

      <form action={createTask} className="glass mt-6 flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-xs text-mist-dim">
          New task
          <input
            name="title"
            required
            placeholder="What needs doing?"
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-mist outline-none focus-visible:ring-2 focus-visible:ring-dusk"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-mist-dim">
          Domain
          <select
            name="domain_id"
            className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-mist outline-none"
          >
            <option value="">None</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-mist-dim">
          Due
          <input
            type="datetime-local"
            name="due_at"
            className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-mist outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-mist-dim">
          Priority
          <select
            name="priority"
            defaultValue="medium"
            className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-mist outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-dawn px-4 py-2 text-sm font-medium text-ink">
          Add
        </button>
      </form>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-mist-dim">Open ({open.length})</h2>
        <div className="mt-3 flex flex-col gap-2">
          {open.length === 0 && <p className="text-sm text-mist-dim">Nothing open. Add something above.</p>}
          {open.map((task) => (
            <TaskRow key={task.id} task={task} threadIndex={threadIndexFor(task.domain_id, domains)} />
          ))}
        </div>
      </section>

      {done.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-mist-dim">Done ({done.length})</h2>
          <div className="mt-3 flex flex-col gap-2">
            {done.map((task) => (
              <TaskRow key={task.id} task={task} threadIndex={threadIndexFor(task.domain_id, domains)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

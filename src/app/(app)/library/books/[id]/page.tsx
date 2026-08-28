import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getBookDetail } from "@/lib/data/library";
import { StatusSelect } from "@/components/status-select";
import { DeleteButton } from "@/components/delete-button";
import { RedirectDeleteButton } from "@/components/redirect-delete-button";
import { updateBookStatus, createHighlight, addThought, deleteBookInPlace, deleteHighlight } from "../../actions";

const STATUSES = ["want", "reading", "finished", "abandoned"] as const;

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let detail: Awaited<ReturnType<typeof getBookDetail>>;
  try {
    detail = await getBookDetail(id);
  } catch {
    notFound();
  }
  const { book, highlights, thoughts } = detail!;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/library" className="inline-flex items-center gap-1 text-xs font-semibold text-ink-faint transition-colors duration-150 hover:text-ink">
        <ArrowLeft size={13} />
        Library
      </Link>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink [overflow-wrap:anywhere]">{book.title}</h1>
          {book.author && <p className="mt-1 truncate text-sm text-ink-faint">{book.author}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusSelect value={book.status} options={STATUSES} onChange={updateBookStatus.bind(null, book.id)} />
          <RedirectDeleteButton
            id={book.id}
            label={`"${book.title}"`}
            buttonLabel="Delete book"
            deleteFn={deleteBookInPlace}
            redirectTo="/library"
          />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Highlights</h2>
        <div className="mt-3 flex flex-col gap-3">
          {highlights.map((h) => (
            <div key={h.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm italic text-ink [overflow-wrap:anywhere]">&ldquo;{h.quote}&rdquo;</p>
                <DeleteButton
                  confirmMessage="Delete this highlight? This can't be undone."
                  label=""
                  pendingLabel=""
                  ariaLabel="Delete highlight"
                  onDelete={deleteHighlight.bind(null, book.id, h.id)}
                  className="-m-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint transition-colors duration-150 hover:text-vermillion"
                />
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {thoughts
                  .filter((t) => t.highlight_id === h.id)
                  .map((t) => (
                    <p key={t.id} className="text-xs text-ink-faint [overflow-wrap:anywhere]">
                      {t.thought}
                    </p>
                  ))}
              </div>
              <form action={addThought.bind(null, book.id, h.id)} className="mt-2 flex gap-2">
                <input name="thought" required placeholder="Add a thought" className="field min-w-0 flex-1 py-1 text-xs" />
                <button type="submit" className="btn-outline py-1 text-xs">
                  Add
                </button>
              </form>
            </div>
          ))}
          {highlights.length === 0 && <p className="text-sm text-ink-faint">No highlights yet.</p>}

          <form action={createHighlight.bind(null, book.id)} className="card flex gap-2 p-4">
            <input name="quote" required placeholder="Add a highlight" className="field min-w-0 flex-1" />
            <button type="submit" className="btn">
              Add
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

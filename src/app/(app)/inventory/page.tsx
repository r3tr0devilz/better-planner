import { getInventoryItems } from "@/lib/data/inventory";
import { InventoryRow } from "@/components/inventory-row";
import { createItem } from "./actions";

export default async function InventoryPage() {
  const items = await getInventoryItems();
  const active = items.filter((i) => !i.removed_at);
  const removed = items.filter((i) => i.removed_at);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Inventory</h1>

      <form action={createItem} className="card mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-xs text-ink-faint">
          Item
          <input
            name="name"
            required
            placeholder="What are you keeping tabs on?"
            className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-faint">
          Location
          <input name="location" className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none" />
        </label>
        <button type="submit" className="bg-stamp-red px-4 py-2 text-sm font-medium text-paper-card">
          Add
        </button>
      </form>

      <div className="ledger mt-8">
        {active.map((item) => (
          <InventoryRow key={item.id} item={item} />
        ))}
        {active.length === 0 && <p className="py-3 text-sm text-ink-faint">Nothing logged yet.</p>}
      </div>

      {removed.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink-faint">Removed</h2>
          <div className="ledger mt-3">
            {removed.map((item) => (
              <InventoryRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

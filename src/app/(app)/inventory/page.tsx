import { getInventoryItems } from "@/lib/data/inventory";
import { InventoryRow } from "@/components/inventory-row";
import { PageHeader } from "@/components/page-header";
import { createItem } from "./actions";

export default async function InventoryPage() {
  const items = await getInventoryItems();
  const active = items.filter((i) => !i.removed_at);
  const removed = items.filter((i) => i.removed_at);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Inventory" context={`${active.length} active item${active.length === 1 ? "" : "s"}`} />

      <form action={createItem} className="field-row card mt-6 p-4">
        <label className="field-wide">
          Item
          <input name="name" required placeholder="What are you keeping tabs on?" className="field" />
        </label>
        <label>
          Location
          <input name="location" className="field" />
        </label>
        <button type="submit" className="btn">
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

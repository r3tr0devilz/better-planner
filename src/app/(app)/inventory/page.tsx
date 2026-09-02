import { Package } from "lucide-react";
import { getInventoryItems } from "@/lib/data/inventory";
import { InventoryRow } from "@/components/inventory-row";
import { PageHeader } from "@/components/page-header";
import { CollapsibleForm } from "@/components/collapsible-form";
import { SubmitButton } from "@/components/submit-button";
import { EmptyState } from "@/components/empty-state";
import { createItem } from "./actions";

export default async function InventoryPage() {
  const items = await getInventoryItems();
  const active = items.filter((i) => !i.removed_at);
  const removed = items.filter((i) => i.removed_at);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Inventory" context={`${active.length} active item${active.length === 1 ? "" : "s"}`} />

      <CollapsibleForm action={createItem} triggerLabel="New item">
        <label className="field-wide">
          Item
          <input name="name" required placeholder="What are you keeping tabs on?" className="field" />
        </label>
        <label>
          Location
          <input name="location" className="field" />
        </label>
        <SubmitButton>Add</SubmitButton>
      </CollapsibleForm>

      <h2 className="mt-8 text-sm font-medium text-ink-faint">Kept</h2>
      {active.length === 0 ? (
        <div className="mt-3">
          <EmptyState icon={Package} message="Nothing logged yet — add the first thing you want to keep tabs on." />
        </div>
      ) : (
        <div className="mt-3 border-t border-line">
          {active.map((item) => (
            <InventoryRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {removed.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink-faint">Removed</h2>
          <div className="mt-3 border-t border-line">
            {removed.map((item) => (
              <InventoryRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

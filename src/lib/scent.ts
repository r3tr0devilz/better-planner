import { THREAD_COUNT } from "@/lib/domain-threads";

/** Incense Ledger: each domain thread carries a scent, the same way it
 * carries a color — stable by thread index so a domain always smells the
 * same. A task with no domain (threadIndex -1) gets the unassigned scent. */
const THREAD_SCENTS: { name: string; mark: string; desc: string }[] = [
  { name: "OLIBANUM", mark: "🕯️", desc: "cool resin, citrus peel" },
  { name: "BENZOIN", mark: "🍯", desc: "dry resin, sweet smoke" },
  { name: "SANDALWOOD", mark: "🪵", desc: "creamy wood, warm milk" },
  { name: "CEDAR", mark: "🌲", desc: "dry wood, pencil shavings" },
  { name: "LABDANUM", mark: "🌰", desc: "leather, dark honey" },
  { name: "VETIVER", mark: "🌾", desc: "damp roots, wet earth" },
];

const UNASSIGNED_SCENT = { name: "MYRRH", mark: "🍂", desc: "bitter balsam, warm dust" };

export function scentForThread(threadIndex: number): { name: string; mark: string; desc: string } {
  if (threadIndex < 0) return UNASSIGNED_SCENT;
  return THREAD_SCENTS[threadIndex % THREAD_COUNT];
}

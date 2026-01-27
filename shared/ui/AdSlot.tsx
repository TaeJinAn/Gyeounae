import type { AdSlotId } from "@domain/value-objects/AdSlotId";
import { AdSlotRenderer } from "./AdSlotRenderer";

export async function AdSlot({ slot }: { slot: AdSlotId }) {
  return <AdSlotRenderer slotId={slot} />;
}

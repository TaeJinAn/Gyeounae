import { NextResponse } from "next/server";
import { MariaDbAdCampaignRepository } from "@infra/repositories/MariaDbAdCampaignRepository";
import { GetActiveAdCreativesForSlotUsecase } from "@features/usecases/GetActiveAdCreativesForSlotUsecase";
import type { AdSlotId } from "@domain/value-objects/AdSlotId";

const allowedSlots: AdSlotId[] = ["HOME_TOP", "LIST_INLINE", "DETAIL_BOTTOM"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slot = searchParams.get("slot");
  if (!slot || !allowedSlots.includes(slot as AdSlotId)) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  const creatives = await new GetActiveAdCreativesForSlotUsecase(
    new MariaDbAdCampaignRepository()
  ).execute({ slotId: slot as AdSlotId, now: new Date() });

  return NextResponse.json({
    slot,
    creatives
  });
}

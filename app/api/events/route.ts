import { NextResponse } from "next/server";
import { getSessionPayload } from "@shared/auth/session";
import { LogRecommendationEventUsecase } from "@features/usecases/LogRecommendationEventUsecase";
import { MariaDbRecommendationEventRepository } from "@infra/repositories/MariaDbRecommendationEventRepository";
import type { RecommendationEventType } from "@domain/entities/RecommendationEvent";

type LogEventPayload = {
  itemId: string;
  type: RecommendationEventType;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as LogEventPayload;
  if (!payload?.itemId || !payload?.type) {
    return NextResponse.json({ error: "itemId and type are required" }, { status: 400 });
  }

  const session = await getSessionPayload();
  await new LogRecommendationEventUsecase(
    new MariaDbRecommendationEventRepository()
  ).execute({
    listingId: payload.itemId,
    userId: session?.userId,
    eventType: payload.type
  });

  return NextResponse.json({ ok: true });
}

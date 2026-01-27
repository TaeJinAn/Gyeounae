import { NextResponse } from "next/server";
import { getSessionPayload } from "@shared/auth/session";
import { MariaDbRecommendationEventRepository } from "@infra/repositories/MariaDbRecommendationEventRepository";
import { RecommendationEvent } from "@domain/entities/RecommendationEvent";
import crypto from "crypto";

type ToggleFavoritePayload = {
  itemId: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ToggleFavoritePayload;
  if (!payload?.itemId) {
    return NextResponse.json({ ok: false, message: "itemId가 필요합니다." }, { status: 400 });
  }
  const session = await getSessionPayload();
  if (!session?.userId) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  const repository = new MariaDbRecommendationEventRepository();
  const already = await repository.hasFavorite({
    userId: session.userId,
    itemId: payload.itemId
  });

  if (already) {
    await repository.removeFavorite({
      userId: session.userId,
      itemId: payload.itemId
    });
  } else {
    const event = RecommendationEvent.create({
      id: crypto.randomUUID(),
      listingId: payload.itemId,
      userId: session.userId,
      eventType: "favorite",
      createdAt: new Date()
    });
    await repository.record(event);
  }

  const favoriteCount = await repository.countFavorites({ itemId: payload.itemId });
  return NextResponse.json({
    ok: true,
    message: already ? "찜이 해제되었습니다." : "찜했습니다.",
    favorited: !already,
    favoriteCount
  });
}

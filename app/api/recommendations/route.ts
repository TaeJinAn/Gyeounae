import { NextResponse } from "next/server";
import { getSessionPayload } from "@shared/auth/session";
import { MariaDbListingRepository } from "@infra/repositories/MariaDbListingRepository";
import { MariaDbRecommendationEventRepository } from "@infra/repositories/MariaDbRecommendationEventRepository";
import { GetPersonalSimilarItemsUsecase } from "@features/usecases/GetPersonalSimilarItemsUsecase";

export async function GET(request: Request) {
  const session = await getSessionPayload();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 6);

  const listings = await new GetPersonalSimilarItemsUsecase(
    new MariaDbListingRepository(),
    new MariaDbRecommendationEventRepository()
  ).execute({
    userId: session.userId,
    limit: Number.isFinite(limit) ? limit : 6
  });

  return NextResponse.json({
    items: listings.map((item) => ({
      id: item.id,
      title: item.title,
      brand: item.brand,
      sizeLabel: item.sizeLabel,
      price: item.price.amount,
      primaryImageUrl: item.primaryImageUrl ?? null
    }))
  });
}

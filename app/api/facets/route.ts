import { NextResponse } from "next/server";
import { GetFilterFacetsUsecase } from "@features/usecases/GetFilterFacetsUsecase";
import { MariaDbListingRepository } from "@infra/repositories/MariaDbListingRepository";
import type { ListingSearchCommand } from "@repositories/ListingRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  const itemType = searchParams.get("itemType");
  if (!sport) {
    return NextResponse.json(
      { error: "sport is required" },
      { status: 400 }
    );
  }

  const command: ListingSearchCommand = {
    sport: sport as ListingSearchCommand["sport"],
    category: itemType ? (itemType as ListingSearchCommand["category"]) : undefined
  };

  const usecase = new GetFilterFacetsUsecase(new MariaDbListingRepository());
  const facets = await usecase.execute(command);

  return NextResponse.json(facets);
}

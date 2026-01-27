import type { Listing } from "@domain/entities/Listing";
import type { ListingRepository } from "@repositories/ListingRepository";
import type { TrendingListingCommand } from "@repositories/ListingRepository";

export class GetTrendingItemsUsecase {
  constructor(private readonly listingRepository: ListingRepository) {}

  async execute(command: TrendingListingCommand): Promise<Listing[]> {
    return this.listingRepository.getTrending(command);
  }
}

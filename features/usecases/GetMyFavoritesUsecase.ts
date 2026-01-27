import type { Listing } from "@domain/entities/Listing";
import type { ListingRepository } from "@repositories/ListingRepository";
import type { RecommendationEventRepository } from "@repositories/RecommendationEventRepository";

export class GetMyFavoritesUsecase {
  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly eventRepository: RecommendationEventRepository
  ) {}

  async execute(command: { userId: string }): Promise<Listing[]> {
    const itemIds = await this.eventRepository.findFavoriteItems({
      userId: command.userId
    });
    return this.listingRepository.findByIds({ listingIds: itemIds });
  }
}

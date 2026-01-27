import type { Listing } from "@domain/entities/Listing";
import type {
  ListingRepository,
  ListingSearchCommand
} from "@repositories/ListingRepository";

export class SearchListingsUsecase {
  constructor(private readonly listingRepository: ListingRepository) {}

  async execute(command: ListingSearchCommand): Promise<Listing[]> {
    return this.listingRepository.search(command);
  }
}

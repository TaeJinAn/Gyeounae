import type { Listing } from "@domain/entities/Listing";
import type {
  AdminListingSearchCommand,
  ListingAdminQueryRepository
} from "@repositories/ListingAdminQueryRepository";

export class AdminSearchListingsUsecase {
  constructor(private readonly listingRepository: ListingAdminQueryRepository) {}

  async execute(command: AdminListingSearchCommand): Promise<Listing[]> {
    return this.listingRepository.search(command);
  }
}

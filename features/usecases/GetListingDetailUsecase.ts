import type { Listing } from "@domain/entities/Listing";
import type { ListingRepository } from "@repositories/ListingRepository";

export type GetListingDetailCommand = {
  listingId: string;
};

export class GetListingDetailUsecase {
  constructor(private readonly listingRepository: ListingRepository) {}

  async execute(command: GetListingDetailCommand): Promise<Listing | null> {
    return this.listingRepository.findById(command.listingId);
  }
}

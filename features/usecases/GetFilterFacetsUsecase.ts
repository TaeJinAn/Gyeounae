import type {
  ListingFacetResult,
  ListingRepository,
  ListingSearchCommand
} from "@repositories/ListingRepository";

export class GetFilterFacetsUsecase {
  constructor(private readonly listingRepository: ListingRepository) {}

  async execute(command: ListingSearchCommand): Promise<ListingFacetResult> {
    return this.listingRepository.getFacets(command);
  }
}

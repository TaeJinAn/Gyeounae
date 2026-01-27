import type { Listing } from "@domain/entities/Listing";
import type { ListingCategory } from "@domain/value-objects/ListingCategory";
import type { Sport } from "@domain/value-objects/Sport";
import type { Gender } from "@domain/value-objects/Gender";
import type { ItemCondition } from "@domain/value-objects/ItemCondition";

export type ListingSearchCommand = {
  sport: Sport;
  category?: ListingCategory;
  gender?: Gender;
  brand?: string;
  sizeLabel?: string;
  sort?: "all" | "latest" | "priceAsc" | "priceDesc";
};

export type ListingFacetResult = {
  genders: Array<{ value: Gender; count: number }>;
  brands: Array<{ value: string; count: number }>;
  sizes: Array<{ value: string; count: number }>;
};

export type SimilarCandidatesCommand = {
  listingId: string;
  limit: number;
};

export type ListingImagesCommand = {
  listingId: string;
};

export type ListingPopularityCommand = {
  listingIds: string[];
};

export type TrendingListingCommand = {
  sport?: Sport;
  limit: number;
};

export type FindListingsByIdsCommand = {
  listingIds: string[];
};

export interface ListingRepository {
  search(command: ListingSearchCommand): Promise<Listing[]>;
  getFacets(command: ListingSearchCommand): Promise<ListingFacetResult>;
  findById(listingId: string): Promise<Listing | null>;
  getSimilarCandidates(command: SimilarCandidatesCommand): Promise<Listing[]>;
  getImages(command: ListingImagesCommand): Promise<string[]>;
  getPopularityScores(command: ListingPopularityCommand): Promise<Record<string, number>>;
  getTrending(command: TrendingListingCommand): Promise<Listing[]>;
  findByIds(command: FindListingsByIdsCommand): Promise<Listing[]>;
  findByOwner(command: { userId: string }): Promise<Listing[]>;
}

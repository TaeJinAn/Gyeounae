import type { Listing } from "@domain/entities/Listing";
import type { Sport } from "@domain/value-objects/Sport";

export type AdminListingSearchCommand = {
  sport?: Sport;
  visibility?: "visible" | "hidden" | "deleted";
  status?: "AVAILABLE" | "RESERVED" | "SOLD";
};

export interface ListingAdminQueryRepository {
  search(command: AdminListingSearchCommand): Promise<Listing[]>;
}

import type { Sport } from "@domain/value-objects/Sport";
import type { ListingCategory } from "@domain/value-objects/ListingCategory";

export type BrandScopeSport = "ski" | "snowboard" | "both";
export type BrandSource = "OFFICIAL" | "USER";

export type Brand = {
  id: string;
  nameKo: string;
  nameEn?: string | null;
  scopeSport: BrandScopeSport;
  scopeItemType?: ListingCategory | null;
  source: BrandSource;
};

export type FindBrandForScopeCommand = {
  nameKo: string;
  sport: Sport;
  itemType: ListingCategory | null;
};

export type UpsertUserBrandCommand = {
  nameKo: string;
  nameEn?: string | null;
  sport: Sport;
  itemType: ListingCategory | null;
};

export interface BrandRepository {
  listAll(): Promise<Brand[]>;
  findForScope(command: FindBrandForScopeCommand): Promise<Brand | null>;
  upsertUserBrand(command: UpsertUserBrandCommand): Promise<Brand>;
}

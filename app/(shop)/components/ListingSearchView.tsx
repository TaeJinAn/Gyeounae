import { AdCarousel } from "@shared/ui/AdCarousel";
import { AdSlot } from "@shared/ui/AdSlot";
import { FilterChips } from "@shared/ui/FilterChips";
import { ListingGrid } from "@shared/ui/ListingGrid";
import { ListingEmptyState } from "@shared/ui/ListingEmptyState";
import { MariaDbListingRepository } from "@infra/repositories/MariaDbListingRepository";
import { MariaDbUserRepository } from "@infra/repositories/MariaDbUserRepository";
import { GetFilterFacetsUsecase } from "@features/usecases/GetFilterFacetsUsecase";
import { SearchListingsUsecase } from "@features/usecases/SearchListingsUsecase";
import { GetUserByIdUsecase } from "@features/usecases/GetUserByIdUsecase";
import { GetTrendingItemsUsecase } from "@features/usecases/GetTrendingItemsUsecase";
import type { Sport } from "@domain/value-objects/Sport";
import { categoriesBySport, categoryLabels } from "@domain/value-objects/ListingCategory";
import { genderLabels } from "@domain/value-objects/Gender";
import { getSessionPayload } from "@shared/auth/session";
import {
  buildListingQueryParams,
  parseListingQuery
} from "@shared/query/listingQuery";
import Link from "next/link";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

type ListingSearchViewProps = {
  sport: Sport;
  searchParams: Record<string, string | string[] | undefined>;
  showEmptyState?: boolean;
};

export async function ListingSearchView({
  sport,
  searchParams,
  showEmptyState
}: ListingSearchViewProps) {
  const parsed = parseListingQuery({ searchParams });
  const locale = getLocale();
  const repository = new MariaDbListingRepository();
  const searchUsecase = new SearchListingsUsecase(repository);
  const facetUsecase = new GetFilterFacetsUsecase(repository);
  const userRepository = new MariaDbUserRepository();
  const userUsecase = new GetUserByIdUsecase(userRepository);

  const rawCategory = parsed.category;
  const gender = parsed.gender;
  const brand = parsed.brand;
  const sizeLabel = parsed.size;

  const categoryOptions = categoriesBySport[sport];
  const category =
    rawCategory &&
    categoryOptions.includes(
      rawCategory as (typeof categoryOptions)[number]
    )
      ? rawCategory
      : undefined;

  const command = {
    sport,
    category,
    gender,
    brand,
    sizeLabel,
    sort: parsed.sort
  };

  const [listings, facets] = await Promise.all([
    searchUsecase.execute(command),
    facetUsecase.execute({
      sport,
      category,
      gender,
      brand,
      sizeLabel
    })
  ]);

  const alsoViewed = await new GetTrendingItemsUsecase(repository).execute({
    sport,
    limit: 6
  });

  const session = await getSessionPayload();
  const currentUser = session
    ? await userUsecase.execute({ userId: session.userId })
    : null;
  const canCreateListing = currentUser ? currentUser.canCreateListing() : false;

  const buildNext = (change: Partial<typeof parsed>) =>
    buildListingQueryParams({
      current: parsed,
      change
    });

  const categoryOptionItems = categoryOptions.map((value) => ({
    value,
    label: t(categoryLabels[value] as any, locale)
  }));

  return (
    <div className="flex flex-col gap-6">
      <AdCarousel slot="HOME_TOP" />
      <FilterChips
        title={t("listing.category.title", locale)}
        options={categoryOptionItems}
        selected={category}
        hrefFor={(value) => buildNext({ category: value })}
        allLabel={t("common.all", locale)}
      />
      <section className="flex flex-col gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-navy-600">
          {t("listing.sort.title", locale)}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 text-xs">
          {[
            { value: "all", label: t("listing.sort.all", locale) },
            { value: "latest", label: t("listing.sort.latest", locale) },
            { value: "priceAsc", label: t("listing.sort.priceAsc", locale) },
            { value: "priceDesc", label: t("listing.sort.priceDesc", locale) }
          ].map((option) => {
            const active = parsed.sort === option.value;
            return (
              <Link
                key={option.value}
                href={buildNext({ sort: option.value as typeof parsed.sort })}
                className={`whitespace-nowrap rounded-full border px-3 py-1 ${
                  active
                    ? "border-navy-600 bg-navy-600 text-white"
                    : "border-ice-200 text-navy-600"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </section>
      <FilterChips
        title={t("listing.gender.title", locale)}
        options={facets.genders.map((item) => ({
          value: item.value,
          label: t(genderLabels[item.value] as any, locale)
        }))}
        selected={gender}
        hrefFor={(value) => buildNext({ gender: value })}
        allLabel={t("common.all", locale)}
      />
      <FilterChips
        title={t("listing.brand.title", locale)}
        options={facets.brands.map((item) => ({
          value: item.value,
          label: item.value
        }))}
        selected={brand}
        hrefFor={(value) => buildNext({ brand: value })}
        allLabel={t("common.all", locale)}
      />
      <FilterChips
        title={t("listing.size.title", locale)}
        options={facets.sizes.map((item) => ({
          value: item.value,
          label: item.value
        }))}
        selected={sizeLabel}
        hrefFor={(value) => buildNext({ size: value })}
        allLabel={t("common.all", locale)}
      />
      <ListingGrid listings={listings} locale={locale} />
      {showEmptyState && listings.length === 0 ? (
        <ListingEmptyState
          canCreateListing={canCreateListing}
          title={t("listing.empty.title", locale)}
          subtitle={t("listing.empty.subtitle", locale)}
          createLabel={t("listing.empty.create", locale)}
          createDisabledLabel={t("listing.empty.createDisabled", locale)}
        />
      ) : null}
      {alsoViewed.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="text-sm font-semibold text-navy-700">
            {t("listing.alsoViewed", locale)}
          </div>
          <ListingGrid listings={alsoViewed} locale={locale} />
        </section>
      ) : null}
      <AdSlot slot="LIST_INLINE" />
    </div>
  );
}

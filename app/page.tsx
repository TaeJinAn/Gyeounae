import Link from "next/link";
import { AdSlot } from "@shared/ui/AdSlot";
import { AdCarousel } from "@shared/ui/AdCarousel";
import { getSessionPayload } from "@shared/auth/session";
import { MariaDbListingRepository } from "@infra/repositories/MariaDbListingRepository";
import { MariaDbRecommendationEventRepository } from "@infra/repositories/MariaDbRecommendationEventRepository";
import { GetPersonalSimilarItemsUsecase } from "@features/usecases/GetPersonalSimilarItemsUsecase";
import { GetTrendingItemsUsecase } from "@features/usecases/GetTrendingItemsUsecase";
import { ListingGrid } from "@shared/ui/ListingGrid";
import { NavigationBar } from "@shared/ui/NavigationBar";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

export default async function HomePage() {
  const session = await getSessionPayload();
  const locale = getLocale();
  const listingRepository = new MariaDbListingRepository();
  const trending = await new GetTrendingItemsUsecase(listingRepository).execute({
    limit: 6
  });
  const personal = session
    ? await new GetPersonalSimilarItemsUsecase(
        listingRepository,
        new MariaDbRecommendationEventRepository()
      ).execute({ userId: session.userId, limit: 6 })
    : [];

  return (
    <div className="min-h-screen">
      <NavigationBar />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6">
      <section className="rounded-2xl border border-ice-100 bg-white p-6">
        <div className="text-xl font-semibold text-navy-700">
          {t("home.title", locale)}
        </div>
        <div className="mt-2 text-sm text-navy-600">
          {t("home.subtitle", locale)}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
          <Link
            href="/ski"
            className="rounded-full bg-navy-700 px-4 py-2 text-white"
          >
            {t("home.cta.ski", locale)}
          </Link>
          <Link
            href="/snowboard"
            className="rounded-full border border-ice-200 px-4 py-2 text-navy-700"
          >
            {t("home.cta.snowboard", locale)}
          </Link>
          <Link
            href="/post"
            className="rounded-full border border-ice-200 px-4 py-2 text-navy-700"
          >
            {t("home.cta.post", locale)}
          </Link>
        </div>
      </section>

      {session && personal.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="text-sm font-semibold text-navy-700">
            {t("home.recommend.title", locale)}
          </div>
          <ListingGrid listings={personal} locale={locale} />
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          <div className="text-sm font-semibold text-navy-700">
            {t("home.recommend.title", locale)}
          </div>
          <div className="rounded-2xl border border-ice-100 bg-white p-6 text-sm text-navy-600">
            {t("home.recommend.empty", locale)}
          </div>
        </section>
      )}

      <AdCarousel slot="HOME_TOP" />

      <section className="flex flex-col gap-3">
        <div className="text-sm font-semibold text-navy-700">
          {session && personal.length > 0
            ? t("home.trending.title", locale)
            : t("home.trending.popular", locale)}
        </div>
        {trending.length > 0 ? (
          <ListingGrid listings={trending} locale={locale} />
        ) : (
          <div className="rounded-2xl border border-ice-100 bg-white p-6 text-sm text-navy-600">
            {t("home.trending.empty", locale)}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}

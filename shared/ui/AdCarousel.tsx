import type { AdSlotId } from "@domain/value-objects/AdSlotId";
import { MariaDbAdCampaignRepository } from "@infra/repositories/MariaDbAdCampaignRepository";
import { GetActiveAdCreativesForSlotUsecase } from "@features/usecases/GetActiveAdCreativesForSlotUsecase";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";
import { AdCarouselClient } from "./AdCarouselClient";

export async function AdCarousel({ slot }: { slot: AdSlotId }) {
  const locale = getLocale();
  const creatives = await new GetActiveAdCreativesForSlotUsecase(
    new MariaDbAdCampaignRepository()
  ).execute({ slotId: slot, now: new Date() });

  return (
    <AdCarouselClient
      items={creatives}
      prevLabel={t("ad.carousel.prev", locale)}
      nextLabel={t("ad.carousel.next", locale)}
      badgeLabel={t("ad.carousel.badge", locale)}
    />
  );
}

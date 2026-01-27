import type { AdSlotId } from "@domain/value-objects/AdSlotId";
import { GetActiveAdForSlotUsecase } from "@features/usecases/GetActiveAdForSlotUsecase";
import { MariaDbAdCampaignRepository } from "@infra/repositories/MariaDbAdCampaignRepository";
import Image from "next/image";
import Link from "next/link";

export async function AdSlotRenderer({ slotId }: { slotId: AdSlotId }) {
  const adRepository = new MariaDbAdCampaignRepository();
  const usecase = new GetActiveAdForSlotUsecase(adRepository);
  const campaign = await usecase.execute({ slotId });

  if (!campaign) {
    return null;
  }

  return (
    <Link
      href={campaign.targetUrl}
      className="block overflow-hidden rounded-2xl border border-ice-100 bg-white shadow-sm"
    >
      <Image
        src={campaign.imageUrl}
        alt={campaign.id}
        width={1200}
        height={400}
        className="h-auto w-full object-cover"
        unoptimized
      />
    </Link>
  );
}

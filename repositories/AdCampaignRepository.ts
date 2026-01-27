import type { AdCampaign } from "@domain/entities/AdCampaign";
import type { AdSlotId } from "@domain/value-objects/AdSlotId";

export type ActiveAdCommand = {
  slotId: AdSlotId;
  now: Date;
};

export type ActiveAdCreative = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  imageUrl: string;
  linkUrl: string;
};

export interface AdCampaignRepository {
  findActiveForSlot(command: ActiveAdCommand): Promise<AdCampaign | null>;
  findActiveCreativesForSlot(command: ActiveAdCommand): Promise<ActiveAdCreative[]>;
}

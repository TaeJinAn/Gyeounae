import type { AdCampaignStatus } from "@domain/entities/AdCampaign";
import type { AdSlotId } from "@domain/value-objects/AdSlotId";

export type AdCreativeSummary = {
  id: string;
  campaignId: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
};

export type AdCampaignSummary = {
  id: string;
  title: string;
  slotId: AdSlotId;
  startsAt: Date;
  endsAt: Date;
  status: AdCampaignStatus;
  creatives: AdCreativeSummary[];
};

export interface AdCampaignQueryRepository {
  findCampaigns(): Promise<AdCampaignSummary[]>;
}

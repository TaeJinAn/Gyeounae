import type { AdCampaignStatus } from "@domain/entities/AdCampaign";
import type { AdSlotId } from "@domain/value-objects/AdSlotId";

export type UpdateAdCampaignStatusCommand = {
  campaignId: string;
  status: AdCampaignStatus;
};

export type UpdateAdCampaignCommand = {
  campaignId: string;
  startAt: Date;
  endAt: Date;
  status: AdCampaignStatus;
};

export type AssignAdSlotCommand = {
  campaignId: string;
  slotId: AdSlotId;
  startsAt: Date;
  endsAt: Date;
};

export type CreateAdCampaignCommand = {
  id: string;
  slotId: AdSlotId;
  title: string;
  startAt: Date;
  endAt: Date;
  status: AdCampaignStatus;
  targetingJson?: string;
};

export type CreateAdCreativeCommand = {
  id: string;
  campaignId: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
};

export type DeleteAdCreativeCommand = {
  creativeId: string;
};

export type DeleteAdCampaignCommand = {
  campaignId: string;
};

export type GetAdCampaignSlotCommand = {
  campaignId: string;
};

export interface AdCampaignAdminRepository {
  updateStatus(command: UpdateAdCampaignStatusCommand): Promise<void>;
  updateCampaign(command: UpdateAdCampaignCommand): Promise<void>;
  assignSlot(command: AssignAdSlotCommand): Promise<void>;
  createCampaign(command: CreateAdCampaignCommand): Promise<void>;
  createCreative(command: CreateAdCreativeCommand): Promise<void>;
  deleteCreative(command: DeleteAdCreativeCommand): Promise<void>;
  deleteCampaign(command: DeleteAdCampaignCommand): Promise<void>;
  getCampaignSlot(command: GetAdCampaignSlotCommand): Promise<AdSlotId | null>;
}

import type { AdCampaignQueryRepository, AdCampaignSummary } from "@repositories/AdCampaignQueryRepository";

export class GetAdCampaignsUsecase {
  constructor(private readonly adCampaignRepository: AdCampaignQueryRepository) {}

  async execute(): Promise<AdCampaignSummary[]> {
    return this.adCampaignRepository.findCampaigns();
  }
}

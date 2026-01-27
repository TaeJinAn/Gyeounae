import type {
  ActiveAdCreative,
  AdCampaignRepository,
  ActiveAdCommand
} from "@repositories/AdCampaignRepository";

export class GetActiveAdCreativesForSlotUsecase {
  constructor(private readonly adRepository: AdCampaignRepository) {}

  async execute(command: ActiveAdCommand): Promise<ActiveAdCreative[]> {
    return this.adRepository.findActiveCreativesForSlot(command);
  }
}

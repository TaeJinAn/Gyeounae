import type { AdCampaign } from "@domain/entities/AdCampaign";
import type { AdCampaignRepository } from "@repositories/AdCampaignRepository";
import type { AdSlotId } from "@domain/value-objects/AdSlotId";

export type GetActiveAdCommand = {
  slotId: AdSlotId;
};

export class GetActiveAdForSlotUsecase {
  constructor(private readonly adRepository: AdCampaignRepository) {}

  async execute(command: GetActiveAdCommand): Promise<AdCampaign | null> {
    return this.adRepository.findActiveForSlot({
      slotId: command.slotId,
      now: new Date()
    });
  }
}

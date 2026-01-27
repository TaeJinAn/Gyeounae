import type {
  AdCampaignAdminRepository,
  AssignAdSlotCommand
} from "@repositories/AdCampaignAdminRepository";

export class AssignAdSlotUsecase {
  constructor(
    private readonly adCampaignAdminRepository: AdCampaignAdminRepository
  ) {}

  async execute(command: AssignAdSlotCommand) {
    await this.adCampaignAdminRepository.assignSlot(command);
  }
}

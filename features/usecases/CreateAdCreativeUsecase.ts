import type { AdCampaignAdminRepository } from "@repositories/AdCampaignAdminRepository";
import type { CreateAdCreativeCommand } from "@repositories/AdCampaignAdminRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class CreateAdCreativeUsecase {
  constructor(
    private readonly adCampaignAdminRepository: AdCampaignAdminRepository
  ) {}

  async execute(command: CreateAdCreativeCommand): Promise<Result> {
    try {
      await this.adCampaignAdminRepository.createCreative(command);
      return okResult("소재가 추가되었습니다.");
    } catch {
      return errorResult("소재 추가에 실패했어요.");
    }
  }
}

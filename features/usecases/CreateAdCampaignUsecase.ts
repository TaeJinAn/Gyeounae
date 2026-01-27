import type { AdCampaignAdminRepository } from "@repositories/AdCampaignAdminRepository";
import type { CreateAdCampaignCommand } from "@repositories/AdCampaignAdminRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class CreateAdCampaignUsecase {
  constructor(
    private readonly adCampaignAdminRepository: AdCampaignAdminRepository
  ) {}

  async execute(command: CreateAdCampaignCommand): Promise<Result> {
    try {
      await this.adCampaignAdminRepository.createCampaign(command);
      return okResult("캠페인이 생성되었습니다.");
    } catch {
      return errorResult("캠페인 생성에 실패했어요.");
    }
  }
}

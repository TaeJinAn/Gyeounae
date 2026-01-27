import type { AdCampaignAdminRepository } from "@repositories/AdCampaignAdminRepository";
import type { UpdateAdCampaignCommand } from "@repositories/AdCampaignAdminRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class UpdateAdCampaignUsecase {
  constructor(private readonly repository: AdCampaignAdminRepository) {}

  async execute(command: UpdateAdCampaignCommand): Promise<Result> {
    try {
      await this.repository.updateCampaign(command);
      return okResult("캠페인이 수정되었습니다.");
    } catch {
      return errorResult("캠페인 수정에 실패했어요.");
    }
  }
}

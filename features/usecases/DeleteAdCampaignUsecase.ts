import type { AdCampaignAdminRepository } from "@repositories/AdCampaignAdminRepository";
import type { DeleteAdCampaignCommand } from "@repositories/AdCampaignAdminRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class DeleteAdCampaignUsecase {
  constructor(private readonly repository: AdCampaignAdminRepository) {}

  async execute(command: DeleteAdCampaignCommand): Promise<Result> {
    try {
      await this.repository.deleteCampaign(command);
      return okResult("캠페인이 삭제되었습니다.");
    } catch {
      return errorResult("캠페인 삭제에 실패했어요.");
    }
  }
}

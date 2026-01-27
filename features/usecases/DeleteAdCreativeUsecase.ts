import type { AdCampaignAdminRepository } from "@repositories/AdCampaignAdminRepository";
import type { DeleteAdCreativeCommand } from "@repositories/AdCampaignAdminRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class DeleteAdCreativeUsecase {
  constructor(private readonly repository: AdCampaignAdminRepository) {}

  async execute(command: DeleteAdCreativeCommand): Promise<Result> {
    try {
      await this.repository.deleteCreative(command);
      return okResult("소재가 삭제되었습니다.");
    } catch {
      return errorResult("소재 삭제에 실패했어요.");
    }
  }
}

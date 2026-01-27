import type {
  AdCampaignAdminRepository,
  UpdateAdCampaignStatusCommand
} from "@repositories/AdCampaignAdminRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class UpdateAdCampaignStatusUsecase {
  constructor(
    private readonly adCampaignAdminRepository: AdCampaignAdminRepository
  ) {}

  async execute(command: UpdateAdCampaignStatusCommand): Promise<Result> {
    try {
      await this.adCampaignAdminRepository.updateStatus(command);
      const message =
        command.status === "PAUSED"
          ? "캠페인이 일시정지되었습니다."
          : command.status === "RUNNING"
            ? "캠페인이 재개되었습니다."
            : "상태가 변경되었습니다.";
      return okResult(message);
    } catch {
      return errorResult("캠페인 상태 변경에 실패했어요.");
    }
  }
}

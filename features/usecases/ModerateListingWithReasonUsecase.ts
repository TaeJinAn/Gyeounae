import type {
  ListingModerationWriteCommand,
  ModerationActionWriterRepository
} from "@repositories/ModerationActionWriterRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class ModerateListingWithReasonUsecase {
  constructor(private readonly repository: ModerationActionWriterRepository) {}

  async execute(command: ListingModerationWriteCommand): Promise<Result> {
    try {
      await this.repository.moderateListing(command);
      return okResult("처리가 완료되었습니다.");
    } catch {
      return errorResult("처리에 실패했어요.");
    }
  }
}

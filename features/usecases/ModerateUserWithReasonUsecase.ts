import type {
  ModerationActionWriterRepository,
  UserModerationWriteCommand
} from "@repositories/ModerationActionWriterRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class ModerateUserWithReasonUsecase {
  constructor(private readonly repository: ModerationActionWriterRepository) {}

  async execute(command: UserModerationWriteCommand): Promise<Result> {
    try {
      await this.repository.moderateUser(command);
      return okResult("처리가 완료되었습니다.");
    } catch {
      return errorResult("처리에 실패했어요.");
    }
  }
}

import type { CommentModerationWriteCommand } from "@repositories/ModerationActionWriterRepository";
import type { ModerationActionWriterRepository } from "@repositories/ModerationActionWriterRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class ModerateCommentWithReasonUsecase {
  constructor(private readonly repository: ModerationActionWriterRepository) {}

  async execute(command: CommentModerationWriteCommand): Promise<Result> {
    try {
      await this.repository.moderateComment(command);
      return okResult("처리가 완료되었습니다.");
    } catch {
      return errorResult("처리에 실패했어요.");
    }
  }
}

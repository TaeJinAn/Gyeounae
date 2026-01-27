import type { CommentRepository } from "@repositories/CommentRepository";
import type { UpdateCommentCommand } from "@repositories/CommentRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class UpdateCommentUsecase {
  constructor(private readonly repository: CommentRepository) {}

  async execute(command: UpdateCommentCommand): Promise<Result> {
    if (!command.body.trim()) {
      return errorResult("댓글 내용을 입력해주세요.");
    }
    const updated = await this.repository.update({
      ...command,
      body: command.body.trim()
    });
    if (!updated) {
      return errorResult("댓글을 수정할 수 없어요.");
    }
    return okResult("댓글이 수정되었습니다.");
  }
}

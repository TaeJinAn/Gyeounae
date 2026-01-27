import type { CommentRepository } from "@repositories/CommentRepository";
import type { DeleteCommentCommand } from "@repositories/CommentRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class DeleteCommentUsecase {
  constructor(private readonly repository: CommentRepository) {}

  async execute(command: DeleteCommentCommand): Promise<Result> {
    const deleted = await this.repository.softDelete(command);
    if (!deleted) {
      return errorResult("댓글을 삭제할 수 없어요.");
    }
    return okResult("댓글이 삭제되었습니다.");
  }
}

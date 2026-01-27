import type { CommentRepository } from "@repositories/CommentRepository";
import type { CreateCommentCommand } from "@repositories/CommentRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class CreateCommentUsecase {
  constructor(private readonly repository: CommentRepository) {}

  async execute(command: CreateCommentCommand): Promise<Result> {
    if (!command.body.trim()) {
      return errorResult("댓글 내용을 입력해주세요.");
    }
    if (command.parentId) {
      const parent = await this.repository.findById({
        commentId: command.parentId
      });
      if (!parent) {
        return errorResult("답글 대상 댓글을 찾을 수 없어요.");
      }
      if (parent.parentId) {
        return errorResult("답글은 1단계까지만 가능합니다.");
      }
      if (parent.itemId !== command.itemId) {
        return errorResult("답글 대상이 올바르지 않습니다.");
      }
    }
    await this.repository.create({
      ...command,
      body: command.body.trim()
    });
    return okResult("댓글이 등록되었습니다.");
  }
}

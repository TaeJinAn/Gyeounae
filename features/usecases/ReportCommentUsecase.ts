import type { CommentReportRepository } from "@repositories/CommentReportRepository";
import type { CreateCommentReportCommand } from "@repositories/CommentReportRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class ReportCommentUsecase {
  constructor(private readonly repository: CommentReportRepository) {}

  async execute(command: CreateCommentReportCommand): Promise<Result> {
    const already = await this.repository.existsByReporter({
      commentId: command.commentId,
      reporterUserId: command.reporterUserId
    });
    if (already) {
      return errorResult("이미 신고한 댓글입니다.");
    }
    await this.repository.create(command);
    return okResult("신고가 접수되었습니다.");
  }
}

import type { CommentReportRepository } from "@repositories/CommentReportRepository";
import type { CommentReportView } from "@repositories/CommentReportRepository";
import type { CommentReportStatus } from "@domain/entities/CommentReport";

export class GetCommentReportsUsecase {
  constructor(private readonly repository: CommentReportRepository) {}

  async execute(command: { status?: CommentReportStatus }): Promise<CommentReportView[]> {
    return this.repository.findAll(command);
  }
}

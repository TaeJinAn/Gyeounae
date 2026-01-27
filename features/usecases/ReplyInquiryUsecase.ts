import type { InquiryRepository } from "@repositories/InquiryRepository";
import type { ReplyInquiryCommand } from "@repositories/InquiryRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class ReplyInquiryUsecase {
  constructor(private readonly inquiryRepository: InquiryRepository) {}

  async execute(command: ReplyInquiryCommand): Promise<Result> {
    try {
      await this.inquiryRepository.reply(command);
      return okResult("답변이 저장되었습니다.");
    } catch {
      return errorResult("답변 저장에 실패했어요.");
    }
  }
}

import type { InquiryRepository } from "@repositories/InquiryRepository";
import type { CreateInquiryCommand } from "@repositories/InquiryRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class CreateInquiryUsecase {
  constructor(private readonly inquiryRepository: InquiryRepository) {}

  async execute(command: CreateInquiryCommand): Promise<Result> {
    try {
      await this.inquiryRepository.create(command);
      return okResult("문의가 접수되었습니다.");
    } catch {
      return errorResult("문의 접수에 실패했어요.");
    }
  }
}

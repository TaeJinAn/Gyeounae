import type { Inquiry } from "@domain/entities/Inquiry";
import type { InquiryRepository } from "@repositories/InquiryRepository";
import type { InquiryQueryCommand } from "@repositories/InquiryRepository";

export class GetInquiriesUsecase {
  constructor(private readonly inquiryRepository: InquiryRepository) {}

  async execute(command: InquiryQueryCommand): Promise<Inquiry[]> {
    return this.inquiryRepository.findAll(command);
  }
}

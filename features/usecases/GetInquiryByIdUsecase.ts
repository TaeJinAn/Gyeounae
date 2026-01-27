import type { Inquiry } from "@domain/entities/Inquiry";
import type { InquiryRepository } from "@repositories/InquiryRepository";

export class GetInquiryByIdUsecase {
  constructor(private readonly inquiryRepository: InquiryRepository) {}

  async execute(command: { inquiryId: string }): Promise<Inquiry | null> {
    return this.inquiryRepository.findById(command);
  }
}

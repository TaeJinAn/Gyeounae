import type { Inquiry } from "@domain/entities/Inquiry";
import type { InquiryRepository } from "@repositories/InquiryRepository";

export class GetOpenInquiriesUsecase {
  constructor(private readonly inquiryRepository: InquiryRepository) {}

  async execute(): Promise<Inquiry[]> {
    return this.inquiryRepository.findOpenInquiries();
  }
}

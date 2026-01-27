import type { Inquiry } from "@domain/entities/Inquiry";
import type { InquiryStatus } from "@domain/entities/Inquiry";

export type CreateInquiryCommand = {
  id: string;
  userId: string;
  category: string;
  title: string;
  body: string;
  status: InquiryStatus;
  createdAt: Date;
};

export type UpdateInquiryStatusCommand = {
  inquiryId: string;
  status: InquiryStatus;
};

export type ReplyInquiryCommand = {
  inquiryId: string;
  adminReply: string;
  status: InquiryStatus;
  repliedAt: Date;
};

export type InquiryQueryCommand = {
  userId?: string;
  status?: InquiryStatus;
};

export interface InquiryRepository {
  findOpenInquiries(): Promise<Inquiry[]>;
  findAll(command: InquiryQueryCommand): Promise<Inquiry[]>;
  findById(command: { inquiryId: string }): Promise<Inquiry | null>;
  create(command: CreateInquiryCommand): Promise<void>;
  updateStatus(command: UpdateInquiryStatusCommand): Promise<void>;
  reply(command: ReplyInquiryCommand): Promise<void>;
}

import type { CommentReportStatus } from "@domain/entities/CommentReport";

export type CreateCommentReportCommand = {
  id: string;
  commentId: string;
  reporterUserId: string;
  reasonCode: string;
  status: CommentReportStatus;
  createdAt: Date;
  memo?: string | null;
};

export type CommentReportView = {
  reportId: string;
  commentId: string;
  itemId: string;
  commentBody: string;
  commentUserId: string;
  commentUserName: string;
  reporterUserId: string;
  reasonCode: string;
  status: CommentReportStatus;
  createdAt: Date;
  memo?: string | null;
};

export type CommentReportQueryCommand = {
  status?: CommentReportStatus;
};

export type ResolveCommentReportCommand = {
  reportId: string;
};

export type FindCommentReportByUserCommand = {
  commentId: string;
  reporterUserId: string;
};

export interface CommentReportRepository {
  findAll(command: CommentReportQueryCommand): Promise<CommentReportView[]>;
  create(command: CreateCommentReportCommand): Promise<void>;
  resolve(command: ResolveCommentReportCommand): Promise<void>;
  existsByReporter(command: FindCommentReportByUserCommand): Promise<boolean>;
}

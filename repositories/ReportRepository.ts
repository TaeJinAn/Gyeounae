import type { Report } from "@domain/entities/Report";
import type { ReportStatus } from "@domain/entities/Report";

export type CreateReportCommand = {
  id: string;
  reporterUserId: string;
  targetType: "item" | "user";
  targetId: string;
  reasonCode: string;
  status: ReportStatus;
  createdAt: Date;
};

export type UpdateReportStatusCommand = {
  reportId: string;
  status: ReportStatus;
};

export type ReportQueryCommand = {
  status?: ReportStatus;
  reporterUserId?: string;
};

export interface ReportRepository {
  findOpenReports(): Promise<Report[]>;
  findAll(command: ReportQueryCommand): Promise<Report[]>;
  create(command: CreateReportCommand): Promise<void>;
  updateStatus(command: UpdateReportStatusCommand): Promise<void>;
}

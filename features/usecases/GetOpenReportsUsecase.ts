import type { Report } from "@domain/entities/Report";
import type { ReportRepository } from "@repositories/ReportRepository";

export class GetOpenReportsUsecase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(): Promise<Report[]> {
    return this.reportRepository.findOpenReports();
  }
}

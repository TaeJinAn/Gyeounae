import type { Report } from "@domain/entities/Report";
import type { ReportRepository } from "@repositories/ReportRepository";
import type { ReportQueryCommand } from "@repositories/ReportRepository";

export class GetReportsUsecase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: ReportQueryCommand): Promise<Report[]> {
    return this.reportRepository.findAll(command);
  }
}

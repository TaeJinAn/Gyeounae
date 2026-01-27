import type { ReportRepository } from "@repositories/ReportRepository";
import type { UpdateReportStatusCommand } from "@repositories/ReportRepository";

export class UpdateReportStatusUsecase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: UpdateReportStatusCommand) {
    await this.reportRepository.updateStatus(command);
  }
}

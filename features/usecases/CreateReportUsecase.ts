import type { ReportRepository } from "@repositories/ReportRepository";
import type { CreateReportCommand } from "@repositories/ReportRepository";

export class CreateReportUsecase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(command: CreateReportCommand) {
    await this.reportRepository.create(command);
  }
}

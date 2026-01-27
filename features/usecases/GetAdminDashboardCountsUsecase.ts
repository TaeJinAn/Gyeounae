import type { AdminDashboardCounts } from "@repositories/AdminDashboardRepository";
import type { AdminDashboardRepository } from "@repositories/AdminDashboardRepository";

export class GetAdminDashboardCountsUsecase {
  constructor(private readonly dashboardRepository: AdminDashboardRepository) {}

  async execute(): Promise<AdminDashboardCounts> {
    return this.dashboardRepository.getCounts();
  }
}

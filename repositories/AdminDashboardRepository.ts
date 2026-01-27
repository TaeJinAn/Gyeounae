export type AdminDashboardCounts = {
  newItems: number;
  hiddenItems: number;
  reportsPending: number;
  inquiriesPending: number;
  adsRunning: number;
};

export interface AdminDashboardRepository {
  getCounts(): Promise<AdminDashboardCounts>;
}

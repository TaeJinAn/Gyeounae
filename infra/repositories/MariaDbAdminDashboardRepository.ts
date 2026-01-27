import type {
  AdminDashboardCounts,
  AdminDashboardRepository
} from "@repositories/AdminDashboardRepository";
import { mariaDbPool } from "../db/mariaDbPool";

export class MariaDbAdminDashboardRepository
  implements AdminDashboardRepository
{
  async getCounts(): Promise<AdminDashboardCounts> {
    const [itemRows] = await mariaDbPool.query<
      Array<{ new_items: number; hidden_items: number }>
    >(
      `
      SELECT
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS new_items,
        SUM(CASE WHEN is_hidden = 1 AND deleted_at IS NULL THEN 1 ELSE 0 END) AS hidden_items
      FROM items
      `
    );

    const [reportRows] = await mariaDbPool.query<Array<{ count: number }>>(
      "SELECT COUNT(*) AS count FROM reports WHERE status = 'open'"
    );

    const [inquiryRows] = await mariaDbPool.query<Array<{ count: number }>>(
      "SELECT COUNT(*) AS count FROM inquiries WHERE status = 'PENDING'"
    );

    const [adRows] = await mariaDbPool.query<Array<{ count: number }>>(
      `
      SELECT COUNT(*) AS count
      FROM ad_campaigns
      WHERE status IN ('RUNNING', 'active')
        AND start_at <= NOW()
        AND end_at >= NOW()
      `
    );

    return {
      newItems: itemRows[0]?.new_items ?? 0,
      hiddenItems: itemRows[0]?.hidden_items ?? 0,
      reportsPending: reportRows[0]?.count ?? 0,
      inquiriesPending: inquiryRows[0]?.count ?? 0,
      adsRunning: adRows[0]?.count ?? 0
    };
  }
}

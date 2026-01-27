import type {
  ReportRepository,
  CreateReportCommand,
  UpdateReportStatusCommand,
  ReportQueryCommand
} from "@repositories/ReportRepository";
import { Report } from "@domain/entities/Report";
import { mariaDbPool } from "../db/mariaDbPool";

type ReportRow = {
  id: string;
  reporter_user_id: string;
  target_type: "item" | "user";
  target_id: string;
  reason_code: string;
  status: "open" | "reviewed" | "actioned" | "closed";
  created_at: Date;
};

export class MariaDbReportRepository implements ReportRepository {
  async findOpenReports() {
    return this.findAll({ status: "open" });
  }

  async findAll(command: ReportQueryCommand) {
    const conditions: string[] = [];
    const params: Array<string> = [];
    if (command.status) {
      conditions.push("status = ?");
      params.push(command.status);
    }
    if (command.reporterUserId) {
      conditions.push("reporter_user_id = ?");
      params.push(command.reporterUserId);
    }
    const whereSql =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await mariaDbPool.query<ReportRow[]>(
      `SELECT * FROM reports ${whereSql} ORDER BY created_at DESC`,
      params
    );
    return rows.map((row) =>
      Report.create({
        id: row.id,
        reporterId: row.reporter_user_id,
        targetType: row.target_type,
        targetId: row.target_id,
        reason: row.reason_code,
        status: row.status,
        createdAt: row.created_at
      })
    );
  }

  async create(command: CreateReportCommand) {
    await mariaDbPool.query(
      `
      INSERT INTO reports (
        id, reporter_user_id, target_type, target_id, reason_code, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        command.id,
        command.reporterUserId,
        command.targetType,
        command.targetId,
        command.reasonCode,
        command.status,
        command.createdAt
      ]
    );
  }

  async updateStatus(command: UpdateReportStatusCommand) {
    await mariaDbPool.query("UPDATE reports SET status = ? WHERE id = ?", [
      command.status,
      command.reportId
    ]);
  }
}

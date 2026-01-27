import type {
  CommentReportRepository,
  CommentReportView,
  CommentReportQueryCommand,
  CreateCommentReportCommand,
  ResolveCommentReportCommand,
  FindCommentReportByUserCommand
} from "@repositories/CommentReportRepository";
import { mariaDbPool } from "../db/mariaDbPool";

type CommentReportRow = {
  report_id: string;
  comment_id: string;
  item_id: string;
  comment_body: string;
  comment_user_id: string;
  comment_user_name: string;
  reporter_user_id: string;
  reason_code: string;
  status: "PENDING" | "RESOLVED";
  created_at: Date;
  memo?: string | null;
};

const toView = (row: CommentReportRow): CommentReportView => ({
  reportId: row.report_id,
  commentId: row.comment_id,
  itemId: row.item_id,
  commentBody: row.comment_body,
  commentUserId: row.comment_user_id,
  commentUserName: row.comment_user_name,
  reporterUserId: row.reporter_user_id,
  reasonCode: row.reason_code,
  status: row.status,
  createdAt: row.created_at,
  memo: row.memo ?? null
});

export class MariaDbCommentReportRepository implements CommentReportRepository {
  async findAll(command: CommentReportQueryCommand): Promise<CommentReportView[]> {
    const conditions: string[] = [];
    const params: Array<string> = [];
    if (command.status) {
      conditions.push("comment_reports.status = ?");
      params.push(command.status);
    }
    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await mariaDbPool.query<CommentReportRow[]>(
      `
      SELECT
        comment_reports.id AS report_id,
        comment_reports.comment_id,
        comment_reports.reason_code,
        comment_reports.status,
        comment_reports.created_at,
        comment_reports.memo,
        comment_reports.reporter_user_id,
        comments.item_id,
        comments.body AS comment_body,
        comments.user_id AS comment_user_id,
        users.display_name AS comment_user_name
      FROM comment_reports
      INNER JOIN comments ON comments.id = comment_reports.comment_id
      INNER JOIN users ON users.id = comments.user_id
      ${whereSql}
      ORDER BY comment_reports.created_at DESC
      `,
      params
    );
    return rows.map(toView);
  }

  async create(command: CreateCommentReportCommand) {
    await mariaDbPool.query(
      `
      INSERT INTO comment_reports (
        id, comment_id, reporter_user_id, reason_code, status, created_at, memo
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        command.id,
        command.commentId,
        command.reporterUserId,
        command.reasonCode,
        command.status,
        command.createdAt,
        command.memo ?? null
      ]
    );
  }

  async resolve(command: ResolveCommentReportCommand) {
    await mariaDbPool.query(
      "UPDATE comment_reports SET status = 'RESOLVED' WHERE id = ?",
      [command.reportId]
    );
  }

  async existsByReporter(command: FindCommentReportByUserCommand): Promise<boolean> {
    const [rows] = await mariaDbPool.query<Array<{ count: number }>>(
      `
      SELECT COUNT(*) AS count
      FROM comment_reports
      WHERE comment_id = ? AND reporter_user_id = ?
      `,
      [command.commentId, command.reporterUserId]
    );
    return (rows[0]?.count ?? 0) > 0;
  }
}

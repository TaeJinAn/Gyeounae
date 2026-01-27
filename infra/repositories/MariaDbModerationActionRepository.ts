import type {
  ModerationActionRepository,
  ModerationActionQuery,
  ModerationActionRecord
} from "@repositories/ModerationActionRepository";
import { mariaDbPool } from "../db/mariaDbPool";

type ModerationActionRow = {
  id: string;
  admin_user_id: string;
  target_type: string;
  target_id: string;
  action_type: string;
  reason_code: string;
  memo?: string | null;
  created_at: Date;
};

export class MariaDbModerationActionRepository
  implements ModerationActionRepository
{
  async findAll(command: ModerationActionQuery): Promise<ModerationActionRecord[]> {
    const conditions: string[] = [];
    const params: Array<string> = [];
    if (command.actorId) {
      conditions.push("admin_user_id = ?");
      params.push(command.actorId);
    }
    if (command.targetType) {
      conditions.push("target_type = ?");
      params.push(command.targetType);
    }
    if (command.actionType) {
      conditions.push("action_type = ?");
      params.push(command.actionType);
    }
    const whereSql =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await mariaDbPool.query<ModerationActionRow[]>(
      `SELECT * FROM moderation_actions ${whereSql} ORDER BY created_at DESC`,
      params
    );
    return rows.map((row) => ({
      id: row.id,
      adminUserId: row.admin_user_id,
      targetType: row.target_type,
      targetId: row.target_id,
      actionType: row.action_type,
      reasonCode: row.reason_code,
      memo: row.memo ?? null,
      createdAt: row.created_at
    }));
  }

  async findLatestByTarget(command: {
    targetType: string;
    targetId: string;
  }): Promise<ModerationActionRecord | null> {
    const [rows] = await mariaDbPool.query<ModerationActionRow[]>(
      `
      SELECT * FROM moderation_actions
      WHERE target_type = ? AND target_id = ?
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [command.targetType, command.targetId]
    );
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    return {
      id: row.id,
      adminUserId: row.admin_user_id,
      targetType: row.target_type,
      targetId: row.target_id,
      actionType: row.action_type,
      reasonCode: row.reason_code,
      memo: row.memo ?? null,
      createdAt: row.created_at
    };
  }
}

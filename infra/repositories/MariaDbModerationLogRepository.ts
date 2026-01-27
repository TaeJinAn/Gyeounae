import type { ModerationLogRepository } from "@repositories/ModerationLogRepository";
import type { ModerationLog } from "@domain/entities/ModerationLog";
import { mariaDbPool } from "../db/mariaDbPool";

export class MariaDbModerationLogRepository implements ModerationLogRepository {
  async record(action: ModerationLog) {
    const targetType = action.actionType.includes("user")
      ? "user"
      : action.actionType.includes("listing")
        ? "listing"
        : action.actionType.includes("report")
          ? "report"
          : "inquiry";
    await mariaDbPool.query(
      `
      INSERT INTO moderation_actions (id, admin_user_id, target_type, target_id, action_type, reason_code, memo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        action.id,
        action.actorId,
        targetType,
        action.targetId,
        action.actionType,
        action.reason,
        null,
        action.createdAt
      ]
    );
  }
}

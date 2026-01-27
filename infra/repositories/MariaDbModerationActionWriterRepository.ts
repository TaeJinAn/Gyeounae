import type {
  CommentModerationWriteCommand,
  ListingModerationWriteCommand,
  ModerationActionWriterRepository,
  UserModerationWriteCommand
} from "@repositories/ModerationActionWriterRepository";
import { mariaDbPool } from "../db/mariaDbPool";
import crypto from "crypto";

export class MariaDbModerationActionWriterRepository
  implements ModerationActionWriterRepository
{
  async moderateListing(command: ListingModerationWriteCommand) {
    const connection = await mariaDbPool.getConnection();
    try {
      await connection.beginTransaction();
      await this.applyListingAction(connection, command);
      await connection.query(
        `
        INSERT INTO moderation_actions (
          id, admin_user_id, target_type, target_id, action_type, reason_code, memo, created_at
        ) VALUES (?, ?, 'listing', ?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),
          command.actorId,
          command.listingId,
          command.actionType,
          command.reasonCode,
          command.memo ?? null,
          new Date()
        ]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async moderateUser(command: UserModerationWriteCommand) {
    const connection = await mariaDbPool.getConnection();
    try {
      await connection.beginTransaction();
      await this.applyUserAction(connection, command);
      await connection.query(
        `
        INSERT INTO moderation_actions (
          id, admin_user_id, target_type, target_id, action_type, reason_code, memo, created_at
        ) VALUES (?, ?, 'user', ?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),
          command.actorId,
          command.userId,
          command.actionType,
          command.reasonCode,
          command.memo ?? null,
          new Date()
        ]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async moderateComment(command: CommentModerationWriteCommand) {
    const connection = await mariaDbPool.getConnection();
    try {
      await connection.beginTransaction();
      await this.applyCommentAction(connection, command);
      await connection.query(
        `
        INSERT INTO moderation_actions (
          id, admin_user_id, target_type, target_id, action_type, reason_code, memo, created_at
        ) VALUES (?, ?, 'comment', ?, ?, ?, ?, ?)
        `,
        [
          crypto.randomUUID(),
          command.actorId,
          command.commentId,
          command.actionType,
          command.reasonCode,
          command.memo ?? null,
          new Date()
        ]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async applyListingAction(
    connection: any,
    command: ListingModerationWriteCommand
  ) {
    if (command.actionType === "hide-listing") {
      await connection.query("UPDATE items SET is_hidden = 1 WHERE id = ?", [
        command.listingId
      ]);
      return;
    }
    if (command.actionType === "restore-listing") {
      await connection.query("UPDATE items SET is_hidden = 0 WHERE id = ?", [
        command.listingId
      ]);
      return;
    }
    if (command.actionType === "force-sold") {
      await connection.query(
        "UPDATE items SET status = 'SOLD', is_sold = 1 WHERE id = ?",
        [command.listingId]
      );
      return;
    }
    if (command.actionType === "soft-delete") {
      await connection.query("UPDATE items SET deleted_at = NOW() WHERE id = ?", [
        command.listingId
      ]);
      return;
    }
    if (command.actionType === "set-status" && command.status) {
      await connection.query(
        "UPDATE items SET status = ?, is_sold = ? WHERE id = ?",
        [
          command.status,
          command.status === "SOLD" ? 1 : 0,
          command.listingId
        ]
      );
    }
  }

  private async applyUserAction(connection: any, command: UserModerationWriteCommand) {
    if (command.actionType === "warn-user") {
      return;
    }
    if (command.actionType === "suspend-user") {
      const suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await connection.query(
        "UPDATE users SET status = 'suspended', suspended_until = ? WHERE id = ?",
        [suspendedUntil, command.userId]
      );
      return;
    }
    if (command.actionType === "unban-user") {
      await connection.query(
        "UPDATE users SET status = 'active', suspended_until = NULL WHERE id = ?",
        [command.userId]
      );
      return;
    }
    await connection.query("UPDATE users SET status = 'banned' WHERE id = ?", [
      command.userId
    ]);
  }

  private async applyCommentAction(
    connection: any,
    command: CommentModerationWriteCommand
  ) {
    if (command.actionType === "hide-comment") {
      await connection.query("UPDATE comments SET is_hidden = 1 WHERE id = ?", [
        command.commentId
      ]);
      if (command.reportId) {
        await connection.query(
          "UPDATE comment_reports SET status = 'RESOLVED' WHERE id = ?",
          [command.reportId]
        );
      }
      return;
    }
    if (command.actionType === "delete-comment") {
      await connection.query(
        "UPDATE comments SET deleted_at = NOW() WHERE id = ?",
        [command.commentId]
      );
      if (command.reportId) {
        await connection.query(
          "UPDATE comment_reports SET status = 'RESOLVED' WHERE id = ?",
          [command.reportId]
        );
      }
      return;
    }
    if (command.actionType === "resolve-comment-report" && command.reportId) {
      await connection.query(
        "UPDATE comment_reports SET status = 'RESOLVED' WHERE id = ?",
        [command.reportId]
      );
    }
  }
}

import type {
  CommentRepository,
  CreateCommentCommand,
  DeleteCommentCommand,
  FindCommentCommand,
  FindCommentsCommand,
  HideCommentCommand,
  UpdateCommentCommand,
  CommentView
} from "@repositories/CommentRepository";
import { mariaDbPool } from "../db/mariaDbPool";

type CommentRow = {
  id: string;
  item_id: string;
  user_id: string;
  parent_id?: string | null;
  body: string;
  is_hidden: number;
  deleted_at?: Date | null;
  created_at: Date;
  user_name: string;
};

const toView = (row: CommentRow): CommentView => ({
  id: row.id,
  itemId: row.item_id,
  userId: row.user_id,
  userName: row.user_name,
  parentId: row.parent_id ?? null,
  body: row.body,
  isHidden: row.is_hidden === 1,
  deletedAt: row.deleted_at ?? null,
  createdAt: row.created_at
});

export class MariaDbCommentRepository implements CommentRepository {
  async findByItem(command: FindCommentsCommand): Promise<CommentView[]> {
    const [rows] = await mariaDbPool.query<CommentRow[]>(
      `
      SELECT
        comments.*,
        users.display_name AS user_name
      FROM comments
      INNER JOIN users ON users.id = comments.user_id
      WHERE comments.item_id = ?
      ORDER BY comments.created_at DESC
      `,
      [command.itemId]
    );
    return rows.map(toView);
  }

  async findById(command: FindCommentCommand): Promise<CommentView | null> {
    const [rows] = await mariaDbPool.query<CommentRow[]>(
      `
      SELECT
        comments.*,
        users.display_name AS user_name
      FROM comments
      INNER JOIN users ON users.id = comments.user_id
      WHERE comments.id = ?
      LIMIT 1
      `,
      [command.commentId]
    );
    if (rows.length === 0) {
      return null;
    }
    return toView(rows[0]);
  }

  async create(command: CreateCommentCommand) {
    await mariaDbPool.query(
      `
      INSERT INTO comments (
        id, item_id, user_id, parent_id, body, is_hidden, deleted_at, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, NULL, ?)
      `,
      [
        command.id,
        command.itemId,
        command.userId,
        command.parentId ?? null,
        command.body,
        command.createdAt
      ]
    );
  }

  async update(command: UpdateCommentCommand): Promise<boolean> {
    const [result] = await mariaDbPool.query<any>(
      `
      UPDATE comments
      SET body = ?
      WHERE id = ? AND user_id = ? AND deleted_at IS NULL
      `,
      [command.body, command.commentId, command.userId]
    );
    return (result?.affectedRows ?? 0) > 0;
  }

  async softDelete(command: DeleteCommentCommand): Promise<boolean> {
    const [result] = await mariaDbPool.query<any>(
      `
      UPDATE comments
      SET deleted_at = NOW()
      WHERE id = ? AND user_id = ? AND deleted_at IS NULL
      `,
      [command.commentId, command.userId]
    );
    return (result?.affectedRows ?? 0) > 0;
  }

  async hide(command: HideCommentCommand) {
    await mariaDbPool.query("UPDATE comments SET is_hidden = 1 WHERE id = ?", [
      command.commentId
    ]);
  }
}

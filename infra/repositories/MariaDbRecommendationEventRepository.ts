import type {
  RecommendationEventRepository,
  LatestViewedItemCommand
} from "@repositories/RecommendationEventRepository";
import type { RecommendationEvent } from "@domain/entities/RecommendationEvent";
import { mariaDbPool } from "../db/mariaDbPool";

export class MariaDbRecommendationEventRepository
  implements RecommendationEventRepository
{
  async record(event: RecommendationEvent) {
    await mariaDbPool.query(
      `
      INSERT INTO events (id, user_id, item_id, event_type, created_at)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        event.id,
        event.userId ?? null,
        event.listingId,
        event.eventType,
        event.createdAt
      ]
    );
  }

  async findLatestViewedItem(command: LatestViewedItemCommand) {
    const [rows] = await mariaDbPool.query<Array<{ item_id: string }>>(
      `
      SELECT item_id
      FROM events
      WHERE user_id = ?
        AND event_type = 'view'
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [command.userId]
    );
    return rows[0]?.item_id ?? null;
  }

  async findFavoriteItems(command: { userId: string }) {
    const [rows] = await mariaDbPool.query<Array<{ item_id: string }>>(
      `
      SELECT item_id
      FROM events
      WHERE user_id = ?
        AND event_type = 'favorite'
      GROUP BY item_id
      ORDER BY MAX(created_at) DESC
      `,
      [command.userId]
    );
    return rows.map((row) => row.item_id);
  }

  async hasRecentView(command: {
    userId: string;
    itemId: string;
    withinMinutes: number;
  }) {
    const [rows] = await mariaDbPool.query<Array<{ count: number }>>(
      `
      SELECT COUNT(*) AS count
      FROM events
      WHERE user_id = ?
        AND item_id = ?
        AND event_type = 'view'
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
      `,
      [command.userId, command.itemId, command.withinMinutes]
    );
    return (rows[0]?.count ?? 0) > 0;
  }

  async findRecentViewedItems(command: { userId: string; limit: number }) {
    const [rows] = await mariaDbPool.query<Array<{ item_id: string }>>(
      `
      SELECT item_id
      FROM events
      WHERE user_id = ?
        AND event_type = 'view'
      GROUP BY item_id
      ORDER BY MAX(created_at) DESC
      LIMIT ?
      `,
      [command.userId, command.limit]
    );
    return rows.map((row) => row.item_id);
  }

  async hasFavorite(command: { userId: string; itemId: string }) {
    const [rows] = await mariaDbPool.query<Array<{ count: number }>>(
      `
      SELECT COUNT(*) AS count
      FROM events
      WHERE user_id = ?
        AND item_id = ?
        AND event_type = 'favorite'
      `,
      [command.userId, command.itemId]
    );
    return (rows[0]?.count ?? 0) > 0;
  }

  async removeFavorite(command: { userId: string; itemId: string }) {
    await mariaDbPool.query(
      `
      DELETE FROM events
      WHERE user_id = ? AND item_id = ? AND event_type = 'favorite'
      `,
      [command.userId, command.itemId]
    );
  }

  async countViews(command: { itemId: string }) {
    const [rows] = await mariaDbPool.query<Array<{ count: number }>>(
      `
      SELECT COUNT(*) AS count
      FROM events
      WHERE item_id = ? AND event_type = 'view'
      `,
      [command.itemId]
    );
    return rows[0]?.count ?? 0;
  }

  async countFavorites(command: { itemId: string }) {
    const [rows] = await mariaDbPool.query<Array<{ count: number }>>(
      `
      SELECT COUNT(DISTINCT user_id) AS count
      FROM events
      WHERE item_id = ? AND event_type = 'favorite' AND user_id IS NOT NULL
      `,
      [command.itemId]
    );
    return rows[0]?.count ?? 0;
  }
}

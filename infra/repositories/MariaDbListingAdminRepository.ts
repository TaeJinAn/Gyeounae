import type { ListingAdminRepository } from "@repositories/ListingAdminRepository";
import { mariaDbPool } from "../db/mariaDbPool";

export class MariaDbListingAdminRepository implements ListingAdminRepository {
  async hide(command: { listingId: string }) {
    await mariaDbPool.query(
      "UPDATE items SET is_hidden = 1 WHERE id = ?",
      [command.listingId]
    );
  }

  async restore(command: { listingId: string }) {
    await mariaDbPool.query(
      "UPDATE items SET is_hidden = 0 WHERE id = ?",
      [command.listingId]
    );
  }

  async forceSold(command: { listingId: string }) {
    await mariaDbPool.query(
      "UPDATE items SET status = 'SOLD', is_sold = 1 WHERE id = ?",
      [command.listingId]
    );
  }

  async updateStatus(command: {
    listingId: string;
    status: "AVAILABLE" | "RESERVED" | "SOLD";
  }) {
    await mariaDbPool.query(
      "UPDATE items SET status = ?, is_sold = ? WHERE id = ?",
      [command.status, command.status === "SOLD" ? 1 : 0, command.listingId]
    );
  }

  async softDelete(command: { listingId: string }) {
    await mariaDbPool.query(
      "UPDATE items SET deleted_at = NOW() WHERE id = ?",
      [command.listingId]
    );
  }
}

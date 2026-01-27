import type {
  DeleteMyItemCommand,
  MyItemRepository,
  CreateMyItemCommand,
  UpdateMyItemCommand,
  UpdateMyItemStatusCommand
} from "@repositories/MyItemRepository";
import { MariaDbListingRepository } from "./MariaDbListingRepository";
import { mariaDbPool } from "../db/mariaDbPool";

export class MariaDbMyItemRepository implements MyItemRepository {
  private readonly listingRepository = new MariaDbListingRepository();

  async findAll(command: { userId: string }) {
    return this.listingRepository.findByOwner({ userId: command.userId });
  }

  async create(command: CreateMyItemCommand) {
    await mariaDbPool.query(
      `
      INSERT INTO items (
        id,
        title,
        description,
        sport,
        item_type,
        gender,
        brand_id,
        size_type,
        size_value,
        price,
        region,
        trade_method,
        \`condition\`,
        status,
        is_hidden,
        owner_user_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        command.itemId,
        command.title,
        command.description,
        command.sport,
        command.itemType,
        command.gender,
        command.brandId,
        command.sizeType,
        command.sizeValue,
        command.price,
        command.region,
        command.tradeMethod,
        command.condition,
        "AVAILABLE",
        command.isHidden ? 1 : 0,
        command.userId,
        new Date()
      ]
    );
    await this.replaceImages(command.itemId, command.imageUrls);
  }

  async update(command: UpdateMyItemCommand) {
    await mariaDbPool.query(
      `
      UPDATE items
      SET title = ?, description = ?, sport = ?, item_type = ?, gender = ?,
          brand_id = ?, size_type = ?, size_value = ?, price = ?, region = ?,
          trade_method = ?, \`condition\` = ?, is_hidden = ?
      WHERE id = ? AND owner_user_id = ?
      `,
      [
        command.title,
        command.description,
        command.sport,
        command.itemType,
        command.gender,
        command.brandId,
        command.sizeType,
        command.sizeValue,
        command.price,
        command.region,
        command.tradeMethod,
        command.condition,
        command.isHidden ? 1 : 0,
        command.itemId,
        command.userId
      ]
    );
    await this.replaceImages(command.itemId, command.imageUrls);
  }

  async updateStatus(command: UpdateMyItemStatusCommand) {
    await mariaDbPool.query(
      `
      UPDATE items
      SET status = ?, is_sold = ?
      WHERE id = ? AND owner_user_id = ?
      `,
      [
        command.status,
        command.status === "SOLD" ? 1 : 0,
        command.itemId,
        command.userId
      ]
    );
  }

  async softDelete(command: DeleteMyItemCommand) {
    await mariaDbPool.query(
      "UPDATE items SET deleted_at = NOW() WHERE id = ? AND owner_user_id = ?",
      [command.itemId, command.userId]
    );
  }

  private async replaceImages(itemId: string, imageUrls: string[]) {
    await mariaDbPool.query("DELETE FROM item_images WHERE item_id = ?", [
      itemId
    ]);
    const cleaned = imageUrls.map((url) => url.trim()).filter(Boolean);
    const insertValues = cleaned.map((url, index) => [
      crypto.randomUUID(),
      itemId,
      url,
      index + 1
    ]);
    if (insertValues.length === 0) {
      return;
    }
    await mariaDbPool.query(
      "INSERT INTO item_images (id, item_id, image_url, sort_order) VALUES ?",
      [insertValues]
    );
  }
}

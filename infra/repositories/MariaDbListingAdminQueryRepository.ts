import { Listing } from "@domain/entities/Listing";
import { Money } from "@domain/value-objects/Money";
import type {
  AdminListingSearchCommand,
  ListingAdminQueryRepository
} from "@repositories/ListingAdminQueryRepository";
import { mariaDbPool } from "../db/mariaDbPool";

type ListingRow = {
  id: string;
  title: string;
  description: string;
  sport: "ski" | "snowboard";
  item_type: string;
  gender: "men" | "women" | "unisex";
  brand_name: string;
  size_type: string;
  size_value: string;
  price: number;
  region: string;
  trade_method: string;
  condition: string;
  status?: "AVAILABLE" | "RESERVED" | "SOLD" | null;
  is_hidden: number;
  is_sold: number;
  deleted_at?: Date | null;
  owner_user_id: string;
  created_at: Date;
  primary_image_url?: string | null;
};

export class MariaDbListingAdminQueryRepository
  implements ListingAdminQueryRepository
{
  async search(command: AdminListingSearchCommand) {
    const conditions: string[] = [];
    const params: Array<string> = [];

    if (command.sport) {
      conditions.push("sport = ?");
      params.push(command.sport);
    }
    if (command.visibility) {
      if (command.visibility === "visible") {
        conditions.push("items.is_hidden = 0", "items.deleted_at IS NULL");
      }
      if (command.visibility === "hidden") {
        conditions.push("items.is_hidden = 1", "items.deleted_at IS NULL");
      }
      if (command.visibility === "deleted") {
        conditions.push("items.deleted_at IS NOT NULL");
      }
    }
    if (command.status) {
      conditions.push("items.status = ?");
      params.push(command.status);
    }

    const whereSql =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await mariaDbPool.query<ListingRow[]>(
      `
      SELECT
        items.*,
        brands.name_ko AS brand_name,
        images.image_url AS primary_image_url
      FROM items
      INNER JOIN brands ON brands.id = items.brand_id
      LEFT JOIN item_images AS images
        ON images.item_id = items.id
       AND images.sort_order = 1
      ${whereSql}
      ORDER BY items.created_at DESC
      LIMIT 200
      `,
      params
    );
    return rows.map((row) =>
      Listing.create({
        id: row.id,
        title: row.title,
        description: row.description,
        sport: row.sport,
        category: row.item_type as ListingRow["item_type"],
        gender: row.gender,
        brand: row.brand_name,
        sizeLabel: row.size_value,
        region: row.region,
        tradeMethod: row.trade_method,
        price: Money.won(row.price),
        condition: row.condition as ListingRow["condition"],
        visibility: row.deleted_at
          ? "deleted"
          : row.is_hidden === 1
            ? "hidden"
            : "visible",
        status:
          row.status ?? "AVAILABLE",
        sellerId: row.owner_user_id,
        createdAt: row.created_at,
        primaryImageUrl: row.primary_image_url ?? undefined
      })
    );
  }
}

import { Listing } from "@domain/entities/Listing";
import { Money } from "@domain/value-objects/Money";
import { FootProfile } from "@domain/value-objects/FootProfile";
import type {
  ListingFacetResult,
  ListingRepository,
  ListingSearchCommand,
  SimilarCandidatesCommand,
  ListingImagesCommand,
  ListingPopularityCommand,
  TrendingListingCommand,
  FindListingsByIdsCommand
} from "@repositories/ListingRepository";
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
  seller_foot_length_mm?: number | null;
  seller_foot_width_mm?: number | null;
  seller_foot_height_mm?: number | null;
};

export class MariaDbListingRepository implements ListingRepository {
  async search(command: ListingSearchCommand) {
    const { whereSql, params } = this.buildWhere(command);
    const orderBy = this.buildOrder(command.sort);
    const [rows] = await mariaDbPool.query<ListingRow[]>(
      `
      SELECT
        items.*,
        brands.name_ko AS brand_name,
        images.image_url AS primary_image_url,
        seller_foot.foot_length_mm AS seller_foot_length_mm,
        seller_foot.foot_width_mm AS seller_foot_width_mm,
        seller_foot.foot_height_mm AS seller_foot_height_mm
      FROM items
      INNER JOIN brands ON brands.id = items.brand_id
      LEFT JOIN item_images AS images
        ON images.item_id = items.id
       AND images.sort_order = 1
      LEFT JOIN foot_profiles AS seller_foot
        ON seller_foot.user_id = items.owner_user_id
      ${whereSql}
      ORDER BY ${orderBy}
      LIMIT 80
      `,
      params
    );
    return rows.map((row) => this.toListing(row));
  }

  async getFacets(command: ListingSearchCommand): Promise<ListingFacetResult> {
    const { whereSql, params } = this.buildWhere(command);

    const [genderRows] = await mariaDbPool.query<
      Array<{ value: ListingRow["gender"]; count: number }>
    >(
      `
      SELECT items.gender AS value, COUNT(*) AS count
      FROM items
      INNER JOIN brands ON brands.id = items.brand_id
      ${whereSql}
      GROUP BY items.gender
      HAVING COUNT(*) > 0
      `,
      params
    );

    const { conditions, params: itemParams } = this.buildItemFilters(command);
    const itemJoin =
      conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";
    const scopeConditions = ["(brands.scope_sport = ? OR brands.scope_sport = 'both')"];
    const scopeParams: Array<string> = [command.sport];
    if (command.category) {
      scopeConditions.push(
        "(brands.scope_item_type IS NULL OR brands.scope_item_type = ?)"
      );
      scopeParams.push(command.category);
    }
    const [brandRows] = await mariaDbPool.query<
      Array<{ value: string; count: number }>
    >(
      `
      SELECT brands.name_ko AS value, COUNT(items.id) AS count
      FROM brands
      LEFT JOIN items
        ON items.brand_id = brands.id
       ${itemJoin}
      WHERE ${scopeConditions.join(" AND ")}
      GROUP BY brands.id, brands.name_ko
      ORDER BY brands.name_ko ASC
      `,
      [...itemParams, ...scopeParams]
    );

    const [sizeRows] = await mariaDbPool.query<
      Array<{ value: string; count: number }>
    >(
      `
      SELECT items.size_value AS value, COUNT(*) AS count
      FROM items
      INNER JOIN brands ON brands.id = items.brand_id
      ${whereSql}
      GROUP BY items.size_value
      HAVING COUNT(*) > 0
      `,
      params
    );

    return {
      genders: genderRows,
      brands: brandRows,
      sizes: sizeRows
    };
  }

  async findById(listingId: string) {
    const [rows] = await mariaDbPool.query<ListingRow[]>(
      `
      SELECT
        items.*,
        brands.name_ko AS brand_name,
        images.image_url AS primary_image_url,
        seller_foot.foot_length_mm AS seller_foot_length_mm,
        seller_foot.foot_width_mm AS seller_foot_width_mm,
        seller_foot.foot_height_mm AS seller_foot_height_mm
      FROM items
      INNER JOIN brands ON brands.id = items.brand_id
      LEFT JOIN item_images AS images
        ON images.item_id = items.id
       AND images.sort_order = 1
      LEFT JOIN foot_profiles AS seller_foot
        ON seller_foot.user_id = items.owner_user_id
      WHERE items.id = ?
      LIMIT 1
      `,
      [listingId]
    );
    if (rows.length === 0) {
      return null;
    }
    return this.toListing(rows[0]);
  }

  async getSimilarCandidates(command: SimilarCandidatesCommand) {
    const [rows] = await mariaDbPool.query<ListingRow[]>(
      `
      SELECT
        items.*,
        brands.name_ko AS brand_name,
        images.image_url AS primary_image_url,
        seller_foot.foot_length_mm AS seller_foot_length_mm,
        seller_foot.foot_width_mm AS seller_foot_width_mm,
        seller_foot.foot_height_mm AS seller_foot_height_mm
      FROM items
      INNER JOIN brands ON brands.id = items.brand_id
      LEFT JOIN item_images AS images
        ON images.item_id = items.id
       AND images.sort_order = 1
      LEFT JOIN foot_profiles AS seller_foot
        ON seller_foot.user_id = items.owner_user_id
      WHERE items.id <> ?
        AND items.is_hidden = 0
        AND items.deleted_at IS NULL
        AND items.status <> 'SOLD'
      ORDER BY items.created_at DESC
      LIMIT ?
      `,
      [command.listingId, command.limit]
    );
    return rows.map((row) => this.toListing(row));
  }

  private buildWhere(command: ListingSearchCommand) {
    const { conditions, params } = this.buildItemFilters(command);
    if (command.brand) {
      conditions.push("brands.name_ko = ?");
      params.push(command.brand);
    }
    return {
      whereSql: `WHERE ${conditions.join(" AND ")}`,
      params
    };
  }

  private buildItemFilters(command: ListingSearchCommand) {
    const conditions = [
      "items.is_hidden = 0",
      "items.deleted_at IS NULL",
      "(items.status <> 'SOLD')",
      "items.sport = ?"
    ];
    const params: Array<string> = [command.sport];

    if (command.category) {
      conditions.push("items.item_type = ?");
      params.push(command.category);
    }
    if (command.gender) {
      conditions.push("items.gender = ?");
      params.push(command.gender);
    }
    if (command.sizeLabel) {
      conditions.push("items.size_value = ?");
      params.push(command.sizeLabel);
    }
    return { conditions, params };
  }

  private buildOrder(sort?: ListingSearchCommand["sort"]) {
    if (sort === "priceAsc") {
      return "items.price ASC, items.created_at DESC";
    }
    if (sort === "priceDesc") {
      return "items.price DESC, items.created_at DESC";
    }
    return "items.created_at DESC";
  }

  async getImages(command: ListingImagesCommand) {
    const [rows] = await mariaDbPool.query<Array<{ image_url: string }>>(
      `
      SELECT image_url
      FROM item_images
      WHERE item_id = ?
      ORDER BY sort_order ASC
      `,
      [command.listingId]
    );
    return rows.map((row) => row.image_url);
  }

  async getPopularityScores(command: ListingPopularityCommand) {
    if (command.listingIds.length === 0) {
      return {};
    }
    const placeholders = command.listingIds.map(() => "?").join(", ");
    const [rows] = await mariaDbPool.query<Array<{ item_id: string; count: number }>>(
      `
      SELECT item_id, COUNT(*) AS count
      FROM events
      WHERE event_type IN ('view', 'favorite', 'contact')
        AND item_id IN (${placeholders})
      GROUP BY item_id
      `,
      command.listingIds
    );
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.item_id] = row.count;
      return acc;
    }, {});
  }

  async getTrending(command: TrendingListingCommand) {
    const conditions = [
      "items.is_hidden = 0",
      "items.deleted_at IS NULL",
      "(items.status <> 'SOLD')"
    ];
    const params: Array<string | number> = [];
    if (command.sport) {
      conditions.push("items.sport = ?");
      params.push(command.sport);
    }
    const whereSql =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await mariaDbPool.query<ListingRow[]>(
      `
      SELECT
        items.*,
        brands.name_ko AS brand_name,
        images.image_url AS primary_image_url,
        seller_foot.foot_length_mm AS seller_foot_length_mm,
        seller_foot.foot_width_mm AS seller_foot_width_mm,
        seller_foot.foot_height_mm AS seller_foot_height_mm,
        COUNT(events.id) AS event_count
      FROM items
      INNER JOIN brands ON brands.id = items.brand_id
      LEFT JOIN item_images AS images
        ON images.item_id = items.id
       AND images.sort_order = 1
      LEFT JOIN foot_profiles AS seller_foot
        ON seller_foot.user_id = items.owner_user_id
      LEFT JOIN events ON events.item_id = items.id
        AND events.event_type IN ('view', 'favorite', 'contact')
      ${whereSql}
      GROUP BY items.id
      ORDER BY event_count DESC, items.created_at DESC
      LIMIT ?
      `,
      [...params, command.limit]
    );
    return rows.map((row) => this.toListing(row));
  }

  async findByIds(command: FindListingsByIdsCommand) {
    if (command.listingIds.length === 0) {
      return [];
    }
    const placeholders = command.listingIds.map(() => "?").join(", ");
    const [rows] = await mariaDbPool.query<ListingRow[]>(
      `
      SELECT
        items.*,
        brands.name_ko AS brand_name,
        images.image_url AS primary_image_url,
        seller_foot.foot_length_mm AS seller_foot_length_mm,
        seller_foot.foot_width_mm AS seller_foot_width_mm,
        seller_foot.foot_height_mm AS seller_foot_height_mm
      FROM items
      INNER JOIN brands ON brands.id = items.brand_id
      LEFT JOIN item_images AS images
        ON images.item_id = items.id
       AND images.sort_order = 1
      LEFT JOIN foot_profiles AS seller_foot
        ON seller_foot.user_id = items.owner_user_id
      WHERE items.id IN (${placeholders})
      `,
      command.listingIds
    );
    return rows.map((row) => this.toListing(row));
  }

  async findByOwner(command: { userId: string }) {
    const [rows] = await mariaDbPool.query<ListingRow[]>(
      `
      SELECT
        items.*,
        brands.name_ko AS brand_name,
        images.image_url AS primary_image_url,
        seller_foot.foot_length_mm AS seller_foot_length_mm,
        seller_foot.foot_width_mm AS seller_foot_width_mm,
        seller_foot.foot_height_mm AS seller_foot_height_mm
      FROM items
      INNER JOIN brands ON brands.id = items.brand_id
      LEFT JOIN item_images AS images
        ON images.item_id = items.id
       AND images.sort_order = 1
      LEFT JOIN foot_profiles AS seller_foot
        ON seller_foot.user_id = items.owner_user_id
      WHERE items.owner_user_id = ?
        AND items.deleted_at IS NULL
      ORDER BY items.created_at DESC
      `,
      [command.userId]
    );
    return rows.map((row) => this.toListing(row));
  }

  private toListing(row: ListingRow) {
    return Listing.create({
      id: row.id,
      title: row.title,
      description: row.description,
      sport: row.sport,
      category: row.item_type as ListingRow["item_type"],
      gender: row.gender,
      brand: row.brand_name,
      sizeLabel: `${row.size_type.toUpperCase()} ${row.size_value}`,
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
        row.status ??
        (row.is_sold === 1 ? "SOLD" : "AVAILABLE"),
      sellerId: row.owner_user_id,
      createdAt: row.created_at,
      primaryImageUrl: row.primary_image_url ?? undefined,
      sellerFootProfile: FootProfile.create({
        lengthMm: row.seller_foot_length_mm ?? undefined,
        widthMm: row.seller_foot_width_mm ?? undefined,
        heightMm: row.seller_foot_height_mm ?? undefined
      })
    });
  }
}

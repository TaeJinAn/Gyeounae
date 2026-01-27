import type {
  Brand,
  BrandRepository,
  FindBrandForScopeCommand,
  UpsertUserBrandCommand
} from "@repositories/BrandRepository";
import { mariaDbPool } from "../db/mariaDbPool";
import crypto from "crypto";

type BrandRow = {
  id: string;
  name_ko: string;
  name_en: string | null;
  scope_sport: "ski" | "snowboard" | "both";
  scope_item_type: string | null;
  source: "OFFICIAL" | "USER";
};

export class MariaDbBrandRepository implements BrandRepository {
  async listAll(): Promise<Brand[]> {
    const [rows] = await mariaDbPool.query<BrandRow[]>(
      `
      SELECT id, name_ko, name_en, scope_sport, scope_item_type, source
      FROM brands
      ORDER BY name_ko ASC
      `
    );
    return rows.map((row) => this.toBrand(row));
  }

  async findForScope(command: FindBrandForScopeCommand): Promise<Brand | null> {
    const params: Array<string | null> = [command.nameKo, command.sport];
    const itemTypeClause = command.itemType
      ? "AND (scope_item_type IS NULL OR scope_item_type = ?)"
      : "AND scope_item_type IS NULL";
    if (command.itemType) {
      params.push(command.itemType);
    }
    const [rows] = await mariaDbPool.query<BrandRow[]>(
      `
      SELECT id, name_ko, name_en, scope_sport, scope_item_type, source
      FROM brands
      WHERE name_ko = ?
        AND (scope_sport = ? OR scope_sport = 'both')
        ${itemTypeClause}
      ORDER BY (scope_item_type IS NULL) ASC, (scope_sport = 'both') ASC
      LIMIT 1
      `,
      params
    );
    if (rows.length === 0) {
      return null;
    }
    return this.toBrand(rows[0]);
  }

  async upsertUserBrand(command: UpsertUserBrandCommand): Promise<Brand> {
    const [rows] = await mariaDbPool.query<BrandRow[]>(
      `
      SELECT id, name_ko, name_en, scope_sport, scope_item_type, source
      FROM brands
      WHERE name_ko = ?
        AND scope_sport = ?
        AND scope_item_type <=> ?
        AND source = 'USER'
      LIMIT 1
      `,
      [command.nameKo, command.sport, command.itemType]
    );
    if (rows.length > 0) {
      return this.toBrand(rows[0]);
    }
    const id = crypto.randomUUID();
    await mariaDbPool.query(
      `
      INSERT INTO brands (
        id, name_ko, name_en, scope_sport, scope_item_type, source, created_at
      ) VALUES (?, ?, ?, ?, ?, 'USER', NOW())
      `,
      [id, command.nameKo, command.nameEn ?? null, command.sport, command.itemType]
    );
    return {
      id,
      nameKo: command.nameKo,
      nameEn: command.nameEn ?? null,
      scopeSport: command.sport,
      scopeItemType: command.itemType,
      source: "USER"
    };
  }

  private toBrand(row: BrandRow): Brand {
    return {
      id: row.id,
      nameKo: row.name_ko,
      nameEn: row.name_en,
      scopeSport: row.scope_sport,
      scopeItemType: row.scope_item_type,
      source: row.source
    };
  }
}

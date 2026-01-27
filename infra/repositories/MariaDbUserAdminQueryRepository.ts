import { User } from "@domain/entities/User";
import type { UserRole } from "@domain/entities/User";
import { FootProfile } from "@domain/value-objects/FootProfile";
import type {
  AdminUserSearchCommand,
  UserAdminQueryRepository
} from "@repositories/UserAdminQueryRepository";
import { mariaDbPool } from "../db/mariaDbPool";

type UserRow = {
  id: string;
  display_name: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  status: "active" | "suspended" | "banned";
  terms_accepted_at?: Date | null;
  privacy_accepted_at?: Date | null;
  verified: number;
  foot_length_mm?: number | null;
  foot_width_mm?: number | null;
  foot_height_mm?: number | null;
};

export class MariaDbUserAdminQueryRepository
  implements UserAdminQueryRepository
{
  async search(command: AdminUserSearchCommand) {
    const conditions: string[] = [];
    const params: Array<string> = [];

    if (command.status) {
      conditions.push("status = ?");
      params.push(command.status);
    }
    if (command.role) {
      conditions.push("role = ?");
      params.push(command.role);
    }

    const whereSql =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await mariaDbPool.query<UserRow[]>(
      `
      SELECT
        users.*,
        foot_profiles.foot_length_mm,
        foot_profiles.foot_width_mm,
        foot_profiles.foot_height_mm
      FROM users
      LEFT JOIN foot_profiles ON foot_profiles.user_id = users.id
      ${whereSql}
      ORDER BY users.created_at DESC
      LIMIT 200
      `,
      params
    );

    return rows.map((row) =>
      User.create({
        id: row.id,
        displayName: row.display_name,
        role: row.role.toUpperCase() as UserRole,
        status: row.status,
        identityStatus: row.verified === 1 ? "verified" : "unverified",
        termsAcceptedAt: row.terms_accepted_at ?? null,
        privacyAcceptedAt: row.privacy_accepted_at ?? null,
        footProfile: FootProfile.create({
          lengthMm: row.foot_length_mm ?? undefined,
          widthMm: row.foot_width_mm ?? undefined,
          heightMm: row.foot_height_mm ?? undefined
        })
      })
    );
  }
}

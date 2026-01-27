import { User } from "@domain/entities/User";
import type { UserRole } from "@domain/entities/User";
import { FootProfile } from "@domain/value-objects/FootProfile";
import type { UserRepository } from "@repositories/UserRepository";
import type {
  UserStatusCommand,
  IdentityStatusCommand,
  AuthSubjectCommand,
  CreateUserCommand,
  TermsAcceptanceCommand
} from "@repositories/UserRepository";
import { mariaDbPool } from "../db/mariaDbPool";

type UserRow = {
  id: string;
  display_name: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  status: "active" | "suspended" | "banned";
  terms_accepted_at?: Date | null;
  privacy_accepted_at?: Date | null;
  auth_provider?: string | null;
  provider_user_id?: string | null;
  verified: number;
  verified_at?: Date | null;
  suspended_until?: Date | null;
  foot_length_mm?: number | null;
  foot_width_mm?: number | null;
  foot_height_mm?: number | null;
  created_at: Date;
};

export class MariaDbUserRepository implements UserRepository {
  async findById(userId: string) {
    const [rows] = await mariaDbPool.query<UserRow[]>(
      `
      SELECT
        users.*,
        foot_profiles.foot_length_mm,
        foot_profiles.foot_width_mm,
        foot_profiles.foot_height_mm
      FROM users
      LEFT JOIN foot_profiles ON foot_profiles.user_id = users.id
      WHERE users.id = ?
      LIMIT 1
      `,
      [userId]
    );
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    const role = row.role.toUpperCase() as UserRole;
    return User.create({
      id: row.id,
      displayName: row.display_name,
      role,
      status: row.status,
      suspendedUntil: row.suspended_until ?? null,
      identityStatus: row.verified === 1 ? "verified" : "unverified",
      verifiedAt: row.verified_at ?? null,
      termsAcceptedAt: row.terms_accepted_at ?? null,
      privacyAcceptedAt: row.privacy_accepted_at ?? null,
      footProfile: FootProfile.create({
        lengthMm: row.foot_length_mm ?? undefined,
        widthMm: row.foot_width_mm ?? undefined,
        heightMm: row.foot_height_mm ?? undefined
      })
    });
  }

  async findByAuthSubject(command: AuthSubjectCommand) {
    const [rows] = await mariaDbPool.query<UserRow[]>(
      `
      SELECT
        users.*,
        foot_profiles.foot_length_mm,
        foot_profiles.foot_width_mm,
        foot_profiles.foot_height_mm
      FROM users
      LEFT JOIN foot_profiles ON foot_profiles.user_id = users.id
      WHERE users.auth_provider = ? AND users.provider_user_id = ?
      LIMIT 1
      `,
      [command.provider, command.subject]
    );
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    const role = row.role.toUpperCase() as UserRole;
    return User.create({
      id: row.id,
      displayName: row.display_name,
      role,
      status: row.status,
      suspendedUntil: row.suspended_until ?? null,
      identityStatus: row.verified === 1 ? "verified" : "unverified",
      verifiedAt: row.verified_at ?? null,
      termsAcceptedAt: row.terms_accepted_at ?? null,
      privacyAcceptedAt: row.privacy_accepted_at ?? null,
      footProfile: FootProfile.create({
        lengthMm: row.foot_length_mm ?? undefined,
        widthMm: row.foot_width_mm ?? undefined,
        heightMm: row.foot_height_mm ?? undefined
      })
    });
  }

  async create(command: CreateUserCommand) {
    await mariaDbPool.query(
      `
      INSERT INTO users (
        id,
        display_name,
        role,
        status,
        auth_provider,
        provider_user_id,
        verified,
        verified_at,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        command.id,
        command.displayName,
        command.role,
        command.status,
        command.provider,
        command.subject,
        command.identityStatus === "verified" ? 1 : 0,
        command.identityStatus === "verified" ? new Date() : null,
        new Date()
      ]
    );
    const created = await this.findById(command.id);
    if (!created) {
      throw new Error("Failed to create user");
    }
    return created;
  }

  async updateStatus(command: UserStatusCommand) {
    await mariaDbPool.query("UPDATE users SET status = ? WHERE id = ?", [
      command.status,
      command.userId
    ]);
  }

  async suspend(command: { userId: string; suspendedUntil: Date }) {
    await mariaDbPool.query(
      "UPDATE users SET status = 'suspended', suspended_until = ? WHERE id = ?",
      [command.suspendedUntil, command.userId]
    );
  }

  async clearSuspension(userId: string) {
    await mariaDbPool.query(
      "UPDATE users SET status = 'active', suspended_until = NULL WHERE id = ?",
      [userId]
    );
  }

  async updateIdentityStatus(command: IdentityStatusCommand) {
    await mariaDbPool.query(
      "UPDATE users SET verified = ?, verified_at = ? WHERE id = ?",
      [
        command.identityStatus === "verified" ? 1 : 0,
        command.verifiedAt,
        command.userId
      ]
    );
  }

  async updateTermsAcceptance(command: TermsAcceptanceCommand) {
    await mariaDbPool.query(
      "UPDATE users SET terms_accepted_at = ?, privacy_accepted_at = ? WHERE id = ?",
      [command.termsAcceptedAt, command.privacyAcceptedAt, command.userId]
    );
  }
}

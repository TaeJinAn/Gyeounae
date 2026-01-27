import type { FootProfileRepository } from "@repositories/FootProfileRepository";
import type { SaveFootProfileCommand } from "@repositories/FootProfileRepository";
import { mariaDbPool } from "../db/mariaDbPool";

export class MariaDbFootProfileRepository implements FootProfileRepository {
  async save(command: SaveFootProfileCommand) {
    await mariaDbPool.query(
      `
      INSERT INTO foot_profiles (user_id, foot_length_mm, foot_width_mm, foot_height_mm)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        foot_length_mm = VALUES(foot_length_mm),
        foot_width_mm = VALUES(foot_width_mm),
        foot_height_mm = VALUES(foot_height_mm)
      `,
      [
        command.userId,
        command.footProfile.lengthMm ?? null,
        command.footProfile.widthMm ?? null,
        command.footProfile.heightMm ?? null
      ]
    );
  }
}

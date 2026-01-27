import type {
  AdCampaignAdminRepository,
  UpdateAdCampaignStatusCommand,
  UpdateAdCampaignCommand,
  AssignAdSlotCommand,
  CreateAdCampaignCommand,
  CreateAdCreativeCommand,
  DeleteAdCreativeCommand,
  DeleteAdCampaignCommand,
  GetAdCampaignSlotCommand
} from "@repositories/AdCampaignAdminRepository";
import { mariaDbPool } from "../db/mariaDbPool";

export class MariaDbAdCampaignAdminRepository
  implements AdCampaignAdminRepository
{
  async updateStatus(command: UpdateAdCampaignStatusCommand) {
    await mariaDbPool.query(
      "UPDATE ad_campaigns SET status = ? WHERE id = ?",
      [command.status, command.campaignId]
    );
  }

  async updateCampaign(command: UpdateAdCampaignCommand) {
    await mariaDbPool.query(
      "UPDATE ad_campaigns SET start_at = ?, end_at = ?, status = ? WHERE id = ?",
      [command.startAt, command.endAt, command.status, command.campaignId]
    );
  }

  async assignSlot(command: AssignAdSlotCommand) {
    await mariaDbPool.query(
      `
      UPDATE ad_campaigns
      SET slot_id = (SELECT id FROM ad_slots WHERE slot_key = ?), start_at = ?, end_at = ?
      WHERE id = ?
      `,
      [command.slotId, command.startsAt, command.endsAt, command.campaignId]
    );
  }

  async createCampaign(command: CreateAdCampaignCommand) {
    await mariaDbPool.query(
      `
      INSERT INTO ad_campaigns (
        id, slot_id, title, start_at, end_at, status, targeting_json
      ) VALUES (
        ?, (SELECT id FROM ad_slots WHERE slot_key = ?), ?, ?, ?, ?, ?
      )
      `,
      [
        command.id,
        command.slotId,
        command.title,
        command.startAt,
        command.endAt,
        command.status,
        command.targetingJson ?? null
      ]
    );
  }

  async createCreative(command: CreateAdCreativeCommand) {
    await mariaDbPool.query(
      `
      INSERT INTO ad_creatives (
        id, campaign_id, image_url, link_url, sort_order
      ) VALUES (?, ?, ?, ?, ?)
      `,
      [
        command.id,
        command.campaignId,
        command.imageUrl,
        command.linkUrl,
        command.sortOrder
      ]
    );
  }

  async deleteCreative(command: DeleteAdCreativeCommand) {
    await mariaDbPool.query(
      "DELETE FROM ad_creatives WHERE id = ?",
      [command.creativeId]
    );
  }

  async deleteCampaign(command: DeleteAdCampaignCommand) {
    await mariaDbPool.query(
      "DELETE FROM ad_creatives WHERE campaign_id = ?",
      [command.campaignId]
    );
    await mariaDbPool.query(
      "DELETE FROM ad_campaigns WHERE id = ?",
      [command.campaignId]
    );
  }

  async getCampaignSlot(command: GetAdCampaignSlotCommand) {
    const [rows] = await mariaDbPool.query<Array<{ slot_key: string }>>(
      `
      SELECT ad_slots.slot_key
      FROM ad_campaigns
      INNER JOIN ad_slots ON ad_slots.id = ad_campaigns.slot_id
      WHERE ad_campaigns.id = ?
      LIMIT 1
      `,
      [command.campaignId]
    );
    return (rows[0]?.slot_key as "HOME_TOP" | "LIST_INLINE" | "DETAIL_BOTTOM") ?? null;
  }
}

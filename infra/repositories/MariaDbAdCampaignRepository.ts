import { AdCampaign } from "@domain/entities/AdCampaign";
import type { AdCampaignRepository } from "@repositories/AdCampaignRepository";
import type { ActiveAdCommand } from "@repositories/AdCampaignRepository";
import { mariaDbPool } from "../db/mariaDbPool";

type AdCampaignRow = {
  id: string;
  title: string;
  slot_key: "HOME_TOP" | "LIST_INLINE" | "DETAIL_BOTTOM";
  image_url: string;
  link_url: string;
  start_at: Date;
  end_at: Date;
  status: string;
};

export class MariaDbAdCampaignRepository implements AdCampaignRepository {
  async findActiveForSlot(command: ActiveAdCommand) {
    const [rows] = await mariaDbPool.query<AdCampaignRow[]>(
      `
      SELECT
        ad_campaigns.id,
        ad_campaigns.title,
        ad_slots.slot_key,
        ad_creatives.image_url,
        ad_creatives.link_url,
        ad_campaigns.start_at,
        ad_campaigns.end_at,
        ad_campaigns.status
      FROM ad_campaigns
      INNER JOIN ad_slots ON ad_slots.id = ad_campaigns.slot_id
      INNER JOIN ad_creatives ON ad_creatives.campaign_id = ad_campaigns.id
      WHERE ad_slots.slot_key = ?
        AND ad_campaigns.status IN ('RUNNING', 'active')
        AND ad_campaigns.start_at <= ?
        AND ad_campaigns.end_at >= ?
      ORDER BY ad_campaigns.start_at DESC, ad_creatives.sort_order ASC
      LIMIT 1
      `,
      [command.slotId, command.now, command.now]
    );
    if (rows.length === 0) {
      return null;
    }
    return AdCampaign.create({
      id: rows[0].id,
      title: rows[0].title,
      slotId: rows[0].slot_key,
      imageUrl: rows[0].image_url,
      targetUrl: rows[0].link_url,
      startsAt: rows[0].start_at,
      endsAt: rows[0].end_at,
      status: this.normalizeStatus(rows[0].status)
    });
  }

  async findActiveCreativesForSlot(command: ActiveAdCommand) {
    const [rows] = await mariaDbPool.query<
      Array<{
        id: string;
        campaign_id: string;
        campaign_title: string;
        image_url: string;
        link_url: string;
      }>
    >(
      `
      SELECT
        ad_creatives.id,
        ad_creatives.campaign_id,
        ad_campaigns.title AS campaign_title,
        ad_creatives.image_url,
        ad_creatives.link_url
      FROM ad_campaigns
      INNER JOIN ad_slots ON ad_slots.id = ad_campaigns.slot_id
      INNER JOIN ad_creatives ON ad_creatives.campaign_id = ad_campaigns.id
      WHERE ad_slots.slot_key = ?
        AND ad_campaigns.status IN ('RUNNING', 'active')
        AND ad_campaigns.start_at <= ?
        AND ad_campaigns.end_at >= ?
      ORDER BY ad_campaigns.start_at DESC, ad_creatives.sort_order ASC
      `,
      [command.slotId, command.now, command.now]
    );
    return rows.map((row) => ({
      id: row.id,
      campaignId: row.campaign_id,
      campaignTitle: row.campaign_title,
      imageUrl: row.image_url,
      linkUrl: row.link_url
    }));
  }

  private normalizeStatus(value: string) {
    if (value === "active") return "RUNNING";
    if (value === "scheduled") return "DRAFT";
    if (value === "paused") return "PAUSED";
    if (value === "ended") return "ENDED";
    return value as "DRAFT" | "RUNNING" | "PAUSED" | "ENDED";
  }
}

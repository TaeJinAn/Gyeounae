import type {
  AdCampaignQueryRepository,
  AdCampaignSummary,
  AdCreativeSummary
} from "@repositories/AdCampaignQueryRepository";
import { mariaDbPool } from "../db/mariaDbPool";

type AdCampaignRow = {
  id: string;
  title: string;
  slot_key: "HOME_TOP" | "LIST_INLINE" | "DETAIL_BOTTOM";
  start_at: Date;
  end_at: Date;
  status: string;
};

export class MariaDbAdCampaignQueryRepository
  implements AdCampaignQueryRepository
{
  async findCampaigns(): Promise<AdCampaignSummary[]> {
    const [campaignRows] = await mariaDbPool.query<AdCampaignRow[]>(
      `
      SELECT
        ad_campaigns.id,
        ad_campaigns.title,
        ad_slots.slot_key,
        ad_campaigns.start_at,
        ad_campaigns.end_at,
        ad_campaigns.status
      FROM ad_campaigns
      INNER JOIN ad_slots ON ad_slots.id = ad_campaigns.slot_id
      ORDER BY ad_campaigns.start_at DESC
      `
    );

    const [creativeRows] = await mariaDbPool.query<
      Array<{
        id: string;
        campaign_id: string;
        image_url: string;
        link_url: string;
        sort_order: number;
      }>
    >(
      `
      SELECT id, campaign_id, image_url, link_url, sort_order
      FROM ad_creatives
      ORDER BY sort_order ASC
      `
    );

    const creativeByCampaign = creativeRows.reduce<Record<string, AdCreativeSummary[]>>(
      (acc, row) => {
        const list = acc[row.campaign_id] ?? [];
        list.push({
          id: row.id,
          campaignId: row.campaign_id,
          imageUrl: row.image_url,
          linkUrl: row.link_url,
          sortOrder: row.sort_order
        });
        acc[row.campaign_id] = list;
        return acc;
      },
      {}
    );

    return campaignRows.map((row) => ({
      id: row.id,
      title: row.title,
      slotId: row.slot_key,
      startsAt: row.start_at,
      endsAt: row.end_at,
      status: this.normalizeStatus(row.status),
      creatives: creativeByCampaign[row.id] ?? []
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

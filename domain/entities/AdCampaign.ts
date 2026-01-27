import type { AdSlotId } from "../value-objects/AdSlotId";

export type AdCampaignStatus = "DRAFT" | "RUNNING" | "PAUSED" | "ENDED";

export type AdCampaignProps = {
  id: string;
  title: string;
  slotId: AdSlotId;
  imageUrl: string;
  targetUrl: string;
  startsAt: Date;
  endsAt: Date;
  status: AdCampaignStatus;
};

export class AdCampaign {
  private constructor(private readonly props: AdCampaignProps) {}

  static create(props: AdCampaignProps) {
    return new AdCampaign(props);
  }

  get id() {
    return this.props.id;
  }

  get title() {
    return this.props.title;
  }

  get slotId() {
    return this.props.slotId;
  }

  get imageUrl() {
    return this.props.imageUrl;
  }

  get targetUrl() {
    return this.props.targetUrl;
  }

  get status() {
    return this.props.status;
  }

  canRenderAt(now: Date) {
    if (this.props.status !== "RUNNING") {
      return false;
    }
    return now >= this.props.startsAt && now <= this.props.endsAt;
  }
}

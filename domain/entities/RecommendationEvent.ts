export type RecommendationEventType =
  | "view"
  | "favorite"
  | "contact"
  | "hide";

export type RecommendationEventProps = {
  id: string;
  userId?: string;
  listingId: string;
  eventType: RecommendationEventType;
  createdAt: Date;
};

export class RecommendationEvent {
  private constructor(private readonly props: RecommendationEventProps) {}

  static create(props: RecommendationEventProps) {
    return new RecommendationEvent(props);
  }

  get id() {
    return this.props.id;
  }

  get userId() {
    return this.props.userId;
  }

  get listingId() {
    return this.props.listingId;
  }

  get eventType() {
    return this.props.eventType;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}

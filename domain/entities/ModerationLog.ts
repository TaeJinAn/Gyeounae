export type ModerationActionType =
  | "hide-listing"
  | "restore-listing"
  | "force-sold"
  | "soft-delete"
  | "warn-user"
  | "suspend-user"
  | "ban-user"
  | "unban-user"
  | "review-report"
  | "reply-inquiry";

export type ModerationLogProps = {
  id: string;
  actionType: ModerationActionType;
  actorId: string;
  targetId: string;
  reason: string;
  createdAt: Date;
  reversible: boolean;
};

export class ModerationLog {
  private constructor(private readonly props: ModerationLogProps) {}

  static create(props: ModerationLogProps) {
    return new ModerationLog(props);
  }

  get id() {
    return this.props.id;
  }

  get actionType() {
    return this.props.actionType;
  }

  get actorId() {
    return this.props.actorId;
  }

  get targetId() {
    return this.props.targetId;
  }

  get reason() {
    return this.props.reason;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get reversible() {
    return this.props.reversible;
  }
}

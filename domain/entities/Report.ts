export type ReportStatus = "open" | "reviewed" | "actioned" | "closed";

export type ReportProps = {
  id: string;
  reporterId: string;
  targetType: "listing" | "user";
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
};

export class Report {
  private constructor(private readonly props: ReportProps) {}

  static create(props: ReportProps) {
    return new Report(props);
  }

  get id() {
    return this.props.id;
  }

  get reporterId() {
    return this.props.reporterId;
  }

  get targetType() {
    return this.props.targetType;
  }

  get targetId() {
    return this.props.targetId;
  }

  get reason() {
    return this.props.reason;
  }

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}

export type CommentReportStatus = "PENDING" | "RESOLVED";

export type CommentReportProps = {
  id: string;
  commentId: string;
  reporterUserId: string;
  reasonCode: string;
  status: CommentReportStatus;
  createdAt: Date;
  memo?: string | null;
};

export class CommentReport {
  private constructor(private readonly props: CommentReportProps) {}

  static create(props: CommentReportProps) {
    return new CommentReport(props);
  }

  get id() {
    return this.props.id;
  }

  get commentId() {
    return this.props.commentId;
  }

  get reporterUserId() {
    return this.props.reporterUserId;
  }

  get reasonCode() {
    return this.props.reasonCode;
  }

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get memo() {
    return this.props.memo;
  }
}

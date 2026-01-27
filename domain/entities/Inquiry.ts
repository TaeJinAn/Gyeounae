export type InquiryStatus = "PENDING" | "REPLIED" | "CLOSED";

export type InquiryProps = {
  id: string;
  userId: string;
  category: string;
  title: string;
  body: string;
  status: InquiryStatus;
  adminReply?: string | null;
  repliedAt?: Date | null;
  createdAt: Date;
};

export class Inquiry {
  private constructor(private readonly props: InquiryProps) {}

  static create(props: InquiryProps) {
    return new Inquiry(props);
  }

  get id() {
    return this.props.id;
  }

  get category() {
    return this.props.category;
  }

  get title() {
    return this.props.title;
  }

  get body() {
    return this.props.body;
  }

  get status() {
    return this.props.status;
  }

  get adminReply() {
    return this.props.adminReply;
  }

  get repliedAt() {
    return this.props.repliedAt ?? null;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}

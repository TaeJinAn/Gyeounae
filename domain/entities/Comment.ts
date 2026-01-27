export type CommentProps = {
  id: string;
  itemId: string;
  userId: string;
  parentId?: string | null;
  body: string;
  isHidden: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
};

export class Comment {
  private constructor(private readonly props: CommentProps) {}

  static create(props: CommentProps) {
    return new Comment(props);
  }

  get id() {
    return this.props.id;
  }

  get itemId() {
    return this.props.itemId;
  }

  get userId() {
    return this.props.userId;
  }

  get parentId() {
    return this.props.parentId;
  }

  get body() {
    return this.props.body;
  }

  get isHidden() {
    return this.props.isHidden;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}

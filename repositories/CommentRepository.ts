export type CommentView = {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  parentId?: string | null;
  body: string;
  isHidden: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
};

export type FindCommentsCommand = {
  itemId: string;
};

export type FindCommentCommand = {
  commentId: string;
};

export type CreateCommentCommand = {
  id: string;
  itemId: string;
  userId: string;
  parentId?: string | null;
  body: string;
  createdAt: Date;
};

export type UpdateCommentCommand = {
  commentId: string;
  userId: string;
  body: string;
};

export type DeleteCommentCommand = {
  commentId: string;
  userId: string;
};

export type HideCommentCommand = {
  commentId: string;
};

export interface CommentRepository {
  findByItem(command: FindCommentsCommand): Promise<CommentView[]>;
  findById(command: FindCommentCommand): Promise<CommentView | null>;
  create(command: CreateCommentCommand): Promise<void>;
  update(command: UpdateCommentCommand): Promise<boolean>;
  softDelete(command: DeleteCommentCommand): Promise<boolean>;
  hide(command: HideCommentCommand): Promise<void>;
}

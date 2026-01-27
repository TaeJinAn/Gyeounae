export type ListingModerationWriteCommand = {
  listingId: string;
  actionType:
    | "hide-listing"
    | "restore-listing"
    | "force-sold"
    | "soft-delete"
    | "set-status";
  status?: "AVAILABLE" | "RESERVED" | "SOLD";
  actorId: string;
  reasonCode: string;
  memo?: string | null;
};

export type UserModerationWriteCommand = {
  userId: string;
  actionType: "warn-user" | "suspend-user" | "ban-user" | "unban-user";
  actorId: string;
  reasonCode: string;
  memo?: string | null;
};

export type CommentModerationWriteCommand = {
  commentId: string;
  reportId?: string;
  actionType: "hide-comment" | "delete-comment" | "resolve-comment-report";
  actorId: string;
  reasonCode: string;
  memo?: string | null;
};

export interface ModerationActionWriterRepository {
  moderateListing(command: ListingModerationWriteCommand): Promise<void>;
  moderateUser(command: UserModerationWriteCommand): Promise<void>;
  moderateComment(command: CommentModerationWriteCommand): Promise<void>;
}

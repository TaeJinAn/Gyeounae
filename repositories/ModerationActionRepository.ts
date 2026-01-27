export type ModerationActionRecord = {
  id: string;
  adminUserId: string;
  targetType: string;
  targetId: string;
  actionType: string;
  reasonCode: string;
  memo?: string | null;
  createdAt: Date;
};

export type ModerationActionQuery = {
  actorId?: string;
  targetType?: string;
  actionType?: string;
};

export interface ModerationActionRepository {
  findAll(command: ModerationActionQuery): Promise<ModerationActionRecord[]>;
  findLatestByTarget(command: {
    targetType: string;
    targetId: string;
  }): Promise<ModerationActionRecord | null>;
}

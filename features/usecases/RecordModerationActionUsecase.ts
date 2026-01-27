import { ModerationLog } from "@domain/entities/ModerationLog";
import type { ModerationActionType } from "@domain/entities/ModerationLog";
import type { ModerationLogRepository } from "@repositories/ModerationLogRepository";

export type RecordModerationActionCommand = {
  actionType: ModerationActionType;
  actorId: string;
  targetId: string;
  reason: string;
  reversible: boolean;
};

export class RecordModerationActionUsecase {
  constructor(private readonly moderationLogRepository: ModerationLogRepository) {}

  async execute(command: RecordModerationActionCommand) {
    const log = ModerationLog.create({
      id: crypto.randomUUID(),
      actionType: command.actionType,
      actorId: command.actorId,
      targetId: command.targetId,
      reason: command.reason,
      createdAt: new Date(),
      reversible: command.reversible
    });
    await this.moderationLogRepository.record(log);
  }
}

import { ModerationLog } from "@domain/entities/ModerationLog";
import type { ModerationActionType } from "@domain/entities/ModerationLog";
import type { ModerationLogRepository } from "@repositories/ModerationLogRepository";
import type { UserRepository } from "@repositories/UserRepository";

export type ModerateUserCommand = {
  userId: string;
  actionType: Extract<
    ModerationActionType,
    "warn-user" | "suspend-user" | "ban-user" | "unban-user"
  >;
  actorId: string;
  reason: string;
};

export class ModerateUserUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly moderationLogRepository: ModerationLogRepository
  ) {}

  async execute(command: ModerateUserCommand) {
    await this.applyAction(command);
    const log = ModerationLog.create({
      id: crypto.randomUUID(),
      actionType: command.actionType,
      actorId: command.actorId,
      targetId: command.userId,
      reason: command.reason,
      createdAt: new Date(),
      reversible: command.actionType !== "ban-user"
    });
    await this.moderationLogRepository.record(log);
  }

  private async applyAction(command: ModerateUserCommand) {
    if (command.actionType === "warn-user") {
      return;
    }
    if (command.actionType === "suspend-user") {
      const suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await this.userRepository.suspend({
        userId: command.userId,
        suspendedUntil
      });
      return;
    }
    if (command.actionType === "unban-user") {
      await this.userRepository.clearSuspension(command.userId);
      return;
    }
    await this.userRepository.updateStatus({
      userId: command.userId,
      status: "banned"
    });
  }
}

import { ModerationLog } from "@domain/entities/ModerationLog";
import type { ModerationActionType } from "@domain/entities/ModerationLog";
import type { ListingAdminRepository } from "@repositories/ListingAdminRepository";
import type { ModerationLogRepository } from "@repositories/ModerationLogRepository";

export type ModerateListingCommand = {
  listingId: string;
  actionType: Extract<
    ModerationActionType,
    "hide-listing" | "restore-listing" | "force-sold" | "soft-delete"
  >;
  actorId: string;
  reason: string;
};

export class ModerateListingUsecase {
  constructor(
    private readonly listingAdminRepository: ListingAdminRepository,
    private readonly moderationLogRepository: ModerationLogRepository
  ) {}

  async execute(command: ModerateListingCommand) {
    await this.applyAction(command);
    const log = ModerationLog.create({
      id: crypto.randomUUID(),
      actionType: command.actionType,
      actorId: command.actorId,
      targetId: command.listingId,
      reason: command.reason,
      createdAt: new Date(),
      reversible: command.actionType !== "soft-delete"
    });
    await this.moderationLogRepository.record(log);
  }

  private async applyAction(command: ModerateListingCommand) {
    const moderationCommand = { listingId: command.listingId };
    if (command.actionType === "hide-listing") {
      await this.listingAdminRepository.hide(moderationCommand);
      return;
    }
    if (command.actionType === "restore-listing") {
      await this.listingAdminRepository.restore(moderationCommand);
      return;
    }
    if (command.actionType === "force-sold") {
      await this.listingAdminRepository.forceSold(moderationCommand);
      return;
    }
    await this.listingAdminRepository.softDelete(moderationCommand);
  }
}

import type { ModerationActionRepository } from "@repositories/ModerationActionRepository";

export class GetLatestModerationActionUsecase {
  constructor(private readonly repository: ModerationActionRepository) {}

  async execute(command: { targetType: string; targetId: string }) {
    return this.repository.findLatestByTarget(command);
  }
}

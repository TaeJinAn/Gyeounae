import type {
  ModerationActionQuery,
  ModerationActionRecord,
  ModerationActionRepository
} from "@repositories/ModerationActionRepository";

export class GetModerationActionsUsecase {
  constructor(private readonly repository: ModerationActionRepository) {}

  async execute(command: ModerationActionQuery): Promise<ModerationActionRecord[]> {
    return this.repository.findAll(command);
  }
}

import type { MyItemRepository } from "@repositories/MyItemRepository";
import type { UpdateMyItemStatusCommand } from "@repositories/MyItemRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class UpdateMyItemStatusUsecase {
  constructor(private readonly repository: MyItemRepository) {}

  async execute(command: UpdateMyItemStatusCommand): Promise<Result> {
    try {
      await this.repository.updateStatus(command);
      return okResult("상태가 변경되었습니다.");
    } catch {
      return errorResult("상태 변경에 실패했어요.");
    }
  }
}

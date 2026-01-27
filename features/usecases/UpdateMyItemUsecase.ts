import type { MyItemRepository } from "@repositories/MyItemRepository";
import type { UpdateMyItemCommand } from "@repositories/MyItemRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class UpdateMyItemUsecase {
  constructor(private readonly repository: MyItemRepository) {}

  async execute(command: UpdateMyItemCommand): Promise<Result> {
    try {
      await this.repository.update(command);
      return okResult("수정이 완료되었습니다.");
    } catch {
      return errorResult("수정에 실패했어요.");
    }
  }
}

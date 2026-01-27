import type { MyItemRepository } from "@repositories/MyItemRepository";
import type { DeleteMyItemCommand } from "@repositories/MyItemRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class DeleteMyItemUsecase {
  constructor(private readonly repository: MyItemRepository) {}

  async execute(command: DeleteMyItemCommand): Promise<Result> {
    try {
      await this.repository.softDelete(command);
      return okResult("삭제가 완료되었습니다.");
    } catch {
      return errorResult("삭제에 실패했어요.");
    }
  }
}

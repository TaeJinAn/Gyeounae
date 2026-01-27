import type { MyItemRepository } from "@repositories/MyItemRepository";
import type { UpdateMyItemStatusCommand } from "@repositories/MyItemRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class UpdateMyItemStatusUsecase {
  constructor(private readonly repository: MyItemRepository) {}

  async execute(
    command: UpdateMyItemStatusCommand
  ): Promise<Result & { status?: "AVAILABLE" | "RESERVED" | "SOLD" }> {
    try {
      const result = await this.repository.updateStatus(command);
      if (result.affectedRows === 0) {
        return errorResult("권한이 없거나 게시물을 찾을 수 없어요.");
      }
      return { ...okResult("상태가 변경되었습니다."), status: result.status };
    } catch {
      return errorResult("상태 변경에 실패했어요.");
    }
  }
}

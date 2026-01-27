import type { MyItemRepository } from "@repositories/MyItemRepository";
import type { CreateMyItemCommand } from "@repositories/MyItemRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class CreateMyItemUsecase {
  constructor(private readonly repository: MyItemRepository) {}

  async execute(command: CreateMyItemCommand): Promise<Result> {
    try {
      await this.repository.create(command);
      return okResult("게시물이 등록되었습니다.");
    } catch {
      return errorResult("게시물 등록에 실패했어요.");
    }
  }
}

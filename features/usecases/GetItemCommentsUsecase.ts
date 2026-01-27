import type { CommentRepository } from "@repositories/CommentRepository";
import type { CommentView } from "@repositories/CommentRepository";

export class GetItemCommentsUsecase {
  constructor(private readonly repository: CommentRepository) {}

  async execute(command: { itemId: string }): Promise<CommentView[]> {
    return this.repository.findByItem(command);
  }
}

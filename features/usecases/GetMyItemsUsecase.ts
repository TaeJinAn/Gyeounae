import type { Listing } from "@domain/entities/Listing";
import type { MyItemRepository } from "@repositories/MyItemRepository";
import type { MyItemsCommand } from "@repositories/MyItemRepository";

export class GetMyItemsUsecase {
  constructor(private readonly repository: MyItemRepository) {}

  async execute(command: MyItemsCommand): Promise<Listing[]> {
    return this.repository.findAll(command);
  }
}

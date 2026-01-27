import type { BrandRepository } from "@repositories/BrandRepository";

export class GetBrandOptionsUsecase {
  constructor(private readonly repository: BrandRepository) {}

  async execute() {
    return this.repository.listAll();
  }
}

import type {
  BrandRepository,
  UpsertUserBrandCommand
} from "@repositories/BrandRepository";

export class UpsertUserBrandUsecase {
  constructor(private readonly repository: BrandRepository) {}

  async execute(command: UpsertUserBrandCommand) {
    return this.repository.upsertUserBrand(command);
  }
}

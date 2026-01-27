import type {
  BrandRepository,
  FindBrandForScopeCommand
} from "@repositories/BrandRepository";

export class FindBrandForScopeUsecase {
  constructor(private readonly repository: BrandRepository) {}

  async execute(command: FindBrandForScopeCommand) {
    return this.repository.findForScope(command);
  }
}

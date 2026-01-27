import type { FootProfile } from "@domain/value-objects/FootProfile";
import type { FootProfileRepository } from "@repositories/FootProfileRepository";

export type SaveFootProfileCommand = {
  userId: string;
  footProfile: FootProfile;
};

export class SaveFootProfileUsecase {
  constructor(private readonly footProfileRepository: FootProfileRepository) {}

  async execute(command: SaveFootProfileCommand) {
    await this.footProfileRepository.save(command);
  }
}

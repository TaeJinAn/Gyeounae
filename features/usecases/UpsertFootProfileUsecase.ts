import { FootProfile } from "@domain/value-objects/FootProfile";
import type { FootProfileRepository } from "@repositories/FootProfileRepository";

export type UpsertFootProfileCommand = {
  userId: string;
  footLengthMm?: number | null;
  footWidthMm?: number | null;
  footHeightMm?: number | null;
};

export class UpsertFootProfileUsecase {
  constructor(private readonly repository: FootProfileRepository) {}

  async execute(command: UpsertFootProfileCommand) {
    const lengthMm = this.normalizeNumber(command.footLengthMm);
    const widthMm = this.normalizeNumber(command.footWidthMm);
    const heightMm = this.normalizeNumber(command.footHeightMm);

    await this.repository.save({
      userId: command.userId,
      footProfile: FootProfile.create({
        lengthMm,
        widthMm,
        heightMm
      })
    });
  }

  private normalizeNumber(value?: number | null) {
    if (value === null || typeof value === "undefined") {
      return undefined;
    }
    if (!Number.isFinite(value)) {
      throw new Error("Invalid foot profile value");
    }
    return value;
  }
}

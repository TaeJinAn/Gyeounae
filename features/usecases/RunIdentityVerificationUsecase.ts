import type { UserRepository } from "@repositories/UserRepository";
import type { IdentityVerificationProvider } from "@domain/services/IdentityVerificationProvider";

export type RunIdentityVerificationCommand = {
  userId: string;
};

export class RunIdentityVerificationUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationProvider: IdentityVerificationProvider
  ) {}

  async execute(command: RunIdentityVerificationCommand) {
    const result = await this.verificationProvider.verify({
      userId: command.userId
    });
    await this.userRepository.updateIdentityStatus({
      userId: command.userId,
      identityStatus: "verified",
      verifiedAt: result.verifiedAt
    });
  }
}

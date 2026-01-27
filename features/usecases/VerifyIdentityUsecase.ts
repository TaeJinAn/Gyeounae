import type { UserRepository } from "@repositories/UserRepository";

export type VerifyIdentityCommand = {
  userId: string;
};

export class VerifyIdentityUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: VerifyIdentityCommand) {
    await this.userRepository.updateIdentityStatus({
      userId: command.userId,
      identityStatus: "verified",
      verifiedAt: new Date()
    });
  }
}

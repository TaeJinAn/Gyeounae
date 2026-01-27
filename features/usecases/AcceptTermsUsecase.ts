import type { UserRepository } from "@repositories/UserRepository";

export type AcceptTermsCommand = {
  userId: string;
  acceptedAt: Date;
};

export class AcceptTermsUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: AcceptTermsCommand) {
    await this.userRepository.updateTermsAcceptance({
      userId: command.userId,
      termsAcceptedAt: command.acceptedAt,
      privacyAcceptedAt: command.acceptedAt
    });
  }
}

import type { User } from "@domain/entities/User";
import type { UserRepository } from "@repositories/UserRepository";

export type DevLoginCommand = {
  provider: "dev";
  subject: string;
  displayName: string;
  role?: "USER" | "ADMIN";
};

export class DevLoginUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DevLoginCommand): Promise<User> {
    const existing = await this.userRepository.findByAuthSubject({
      provider: command.provider,
      subject: command.subject
    });
    if (existing) {
      return existing;
    }
    return this.userRepository.create({
      id: crypto.randomUUID(),
      displayName: command.displayName,
      role: command.role ?? "user",
      status: "active",
      identityStatus: "unverified",
      provider: command.provider,
      subject: command.subject
    });
  }
}

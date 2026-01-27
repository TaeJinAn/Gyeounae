import type { User } from "@domain/entities/User";
import type { UserRepository } from "@repositories/UserRepository";

export type GetUserByIdCommand = {
  userId: string;
};

export class GetUserByIdUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: GetUserByIdCommand): Promise<User | null> {
    return this.userRepository.findById(command.userId);
  }
}

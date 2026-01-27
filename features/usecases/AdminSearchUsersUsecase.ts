import type { User } from "@domain/entities/User";
import type {
  AdminUserSearchCommand,
  UserAdminQueryRepository
} from "@repositories/UserAdminQueryRepository";

export class AdminSearchUsersUsecase {
  constructor(private readonly userRepository: UserAdminQueryRepository) {}

  async execute(command: AdminUserSearchCommand): Promise<User[]> {
    return this.userRepository.search(command);
  }
}

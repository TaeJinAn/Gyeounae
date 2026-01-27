import type { User } from "@domain/entities/User";

export type AdminUserSearchCommand = {
  status?: "active" | "suspended" | "banned";
  role?: "USER" | "MODERATOR" | "ADMIN";
};

export interface UserAdminQueryRepository {
  search(command: AdminUserSearchCommand): Promise<User[]>;
}

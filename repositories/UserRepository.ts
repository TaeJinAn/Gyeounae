import type { User, UserStatus } from "@domain/entities/User";

export type UserStatusCommand = {
  userId: string;
  status: UserStatus;
};

export type IdentityStatusCommand = {
  userId: string;
  identityStatus: "unverified" | "verified";
  verifiedAt: Date | null;
};

export type SuspendUserCommand = {
  userId: string;
  suspendedUntil: Date;
};

export type AuthSubjectCommand = {
  provider: string;
  subject: string;
};

export type CreateUserCommand = {
  id: string;
  displayName: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  status: UserStatus;
  identityStatus: "unverified" | "verified";
  provider: string;
  subject: string;
};

export type TermsAcceptanceCommand = {
  userId: string;
  termsAcceptedAt: Date;
  privacyAcceptedAt: Date;
};

export interface UserRepository {
  findById(userId: string): Promise<User | null>;
  findByAuthSubject(command: AuthSubjectCommand): Promise<User | null>;
  create(command: CreateUserCommand): Promise<User>;
  updateStatus(command: UserStatusCommand): Promise<void>;
  suspend(command: SuspendUserCommand): Promise<void>;
  clearSuspension(userId: string): Promise<void>;
  updateIdentityStatus(command: IdentityStatusCommand): Promise<void>;
  updateTermsAcceptance(command: TermsAcceptanceCommand): Promise<void>;
}

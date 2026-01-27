import type { FootProfile } from "../value-objects/FootProfile";
import type { IdentityStatus } from "../value-objects/IdentityStatus";

export type UserRole = "USER" | "MODERATOR" | "ADMIN";
export type UserStatus = "active" | "suspended" | "banned";

export type UserProps = {
  id: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  suspendedUntil?: Date | null;
  identityStatus: IdentityStatus;
  termsAcceptedAt?: Date | null;
  privacyAcceptedAt?: Date | null;
  verifiedAt?: Date | null;
  footProfile?: FootProfile;
};

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps) {
    return new User(props);
  }

  get id() {
    return this.props.id;
  }

  get role() {
    return this.props.role;
  }

  get status() {
    return this.props.status;
  }

  get identityStatus() {
    return this.props.identityStatus;
  }

  get verifiedAt() {
    return this.props.verifiedAt;
  }

  get suspendedUntil() {
    return this.props.suspendedUntil ?? null;
  }

  get footProfile() {
    return this.props.footProfile;
  }

  hasAcceptedTerms() {
    return Boolean(this.props.termsAcceptedAt);
  }

  hasAcceptedPrivacy() {
    return Boolean(this.props.privacyAcceptedAt);
  }

  hasAcceptedPolicies() {
    return this.hasAcceptedTerms() && this.hasAcceptedPrivacy();
  }

  canCreateListing() {
    return (
      this.hasAcceptedPolicies() &&
      this.props.identityStatus === "verified" &&
      this.props.status === "active"
    );
  }

  canContactSeller() {
    return this.canCreateListing();
  }
}

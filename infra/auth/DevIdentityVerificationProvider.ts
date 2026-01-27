import type {
  IdentityVerificationCommand,
  IdentityVerificationProvider,
  IdentityVerificationResult
} from "@domain/services/IdentityVerificationProvider";

export class DevIdentityVerificationProvider
  implements IdentityVerificationProvider
{
  async verify(
    command: IdentityVerificationCommand
  ): Promise<IdentityVerificationResult> {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Dev verification is not allowed in production");
    }
    if (!command.userId) {
      throw new Error("UserId is required for verification");
    }
    return { verifiedAt: new Date() };
  }
}

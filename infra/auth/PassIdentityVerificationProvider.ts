import type {
  IdentityVerificationCommand,
  IdentityVerificationProvider,
  IdentityVerificationResult
} from "@domain/services/IdentityVerificationProvider";

export class PassIdentityVerificationProvider
  implements IdentityVerificationProvider
{
  async verify(
    command: IdentityVerificationCommand
  ): Promise<IdentityVerificationResult> {
    if (!command.userId) {
      throw new Error("UserId is required for verification");
    }
    throw new Error("PASS provider is not configured yet");
  }
}

export type IdentityVerificationResult = {
  verifiedAt: Date;
};

export type IdentityVerificationCommand = {
  userId: string;
};

export interface IdentityVerificationProvider {
  verify(command: IdentityVerificationCommand): Promise<IdentityVerificationResult>;
}

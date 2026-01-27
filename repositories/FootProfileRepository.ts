import type { FootProfile } from "@domain/value-objects/FootProfile";

export type SaveFootProfileCommand = {
  userId: string;
  footProfile: FootProfile;
};

export interface FootProfileRepository {
  save(command: SaveFootProfileCommand): Promise<void>;
}

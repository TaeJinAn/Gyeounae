import type { ModerationLog } from "@domain/entities/ModerationLog";

export interface ModerationLogRepository {
  record(action: ModerationLog): Promise<void>;
}

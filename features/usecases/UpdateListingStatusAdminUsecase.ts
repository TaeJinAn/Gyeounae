import type { ListingAdminRepository } from "@repositories/ListingAdminRepository";
import { errorResult, okResult, type Result } from "@shared/types/Result";

export class UpdateListingStatusAdminUsecase {
  constructor(private readonly repository: ListingAdminRepository) {}

  async execute(command: {
    listingId: string;
    status: "AVAILABLE" | "RESERVED" | "SOLD";
  }): Promise<Result> {
    try {
      await this.repository.updateStatus(command);
      return okResult("상태가 변경되었습니다.");
    } catch {
      return errorResult("상태 변경에 실패했어요.");
    }
  }
}

export type ListingModerationCommand = {
  listingId: string;
};

export interface ListingAdminRepository {
  hide(command: ListingModerationCommand): Promise<void>;
  restore(command: ListingModerationCommand): Promise<void>;
  forceSold(command: ListingModerationCommand): Promise<void>;
  updateStatus(command: ListingModerationCommand & { status: "AVAILABLE" | "RESERVED" | "SOLD" }): Promise<void>;
  softDelete(command: ListingModerationCommand): Promise<void>;
}

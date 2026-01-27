import type { RecommendationEvent } from "@domain/entities/RecommendationEvent";

export type LatestViewedItemCommand = {
  userId: string;
};

export interface RecommendationEventRepository {
  record(event: RecommendationEvent): Promise<void>;
  findLatestViewedItem(command: LatestViewedItemCommand): Promise<string | null>;
  findFavoriteItems(command: { userId: string }): Promise<string[]>;
  hasRecentView(command: { userId: string; itemId: string; withinMinutes: number }): Promise<boolean>;
  findRecentViewedItems(command: { userId: string; limit: number }): Promise<string[]>;
  hasFavorite(command: { userId: string; itemId: string }): Promise<boolean>;
  removeFavorite(command: { userId: string; itemId: string }): Promise<void>;
  countViews(command: { itemId: string }): Promise<number>;
  countFavorites(command: { itemId: string }): Promise<number>;
}

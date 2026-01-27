import { RecommendationEvent } from "@domain/entities/RecommendationEvent";
import type { RecommendationEventType } from "@domain/entities/RecommendationEvent";
import type { RecommendationEventRepository } from "@repositories/RecommendationEventRepository";

export type LogRecommendationEventCommand = {
  listingId: string;
  userId?: string;
  eventType: RecommendationEventType;
};

export class LogRecommendationEventUsecase {
  constructor(
    private readonly eventRepository: RecommendationEventRepository
  ) {}

  async execute(command: LogRecommendationEventCommand) {
    if (!command.userId) {
      return;
    }
    if (command.eventType === "view") {
      const recentlyViewed = await this.eventRepository.hasRecentView({
        userId: command.userId,
        itemId: command.listingId,
        withinMinutes: 10
      });
      if (recentlyViewed) {
        return;
      }
    }
    const event = RecommendationEvent.create({
      id: crypto.randomUUID(),
      listingId: command.listingId,
      userId: command.userId,
      eventType: command.eventType,
      createdAt: new Date()
    });
    await this.eventRepository.record(event);
  }
}

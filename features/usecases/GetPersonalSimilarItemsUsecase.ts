import type { Listing } from "@domain/entities/Listing";
import type { ListingRepository } from "@repositories/ListingRepository";
import type { RecommendationEventRepository } from "@repositories/RecommendationEventRepository";
import { RecommendationScorer } from "@domain/services/RecommendationScorer";

export type PersonalSimilarItemsCommand = {
  userId: string;
  limit: number;
};

export class GetPersonalSimilarItemsUsecase {
  private readonly scorer = new RecommendationScorer();

  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly eventRepository: RecommendationEventRepository
  ) {}

  async execute(command: PersonalSimilarItemsCommand): Promise<Listing[]> {
    const seedIds = await this.eventRepository.findRecentViewedItems({
      userId: command.userId,
      limit: 10
    });
    if (seedIds.length === 0) {
      return [];
    }

    const sources = await this.listingRepository.findByIds({
      listingIds: seedIds
    });
    if (sources.length === 0) {
      return [];
    }

    const candidateLimit = Math.max(12, command.limit * 3);
    const candidateMap = new Map<string, Listing>();
    for (const source of sources) {
      const candidates = await this.listingRepository.getSimilarCandidates({
        listingId: source.id,
        limit: candidateLimit
      });
      for (const candidate of candidates) {
        if (!seedIds.includes(candidate.id)) {
          candidateMap.set(candidate.id, candidate);
        }
      }
    }

    const allCandidates = Array.from(candidateMap.values());
    if (allCandidates.length === 0) {
      return [];
    }

    const popularityMap = await this.listingRepository.getPopularityScores({
      listingIds: allCandidates.map((item) => item.id)
    });
    const maxPopularity = Math.max(
      1,
      ...Object.values(popularityMap),
      1
    );

    const scored = allCandidates.map((candidate) => {
      const bestScore = sources.reduce((maxScore, source) => {
        const score = this.scorer.score({
          source,
          candidate,
          popularityScore:
            ((popularityMap[candidate.id] ?? 0) / maxPopularity) * 100,
          freshnessScore: this.freshness(candidate.createdAt)
        });
        return Math.max(maxScore, score);
      }, 0);
      return { listing: candidate, score: bestScore };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, command.limit)
      .map((entry) => entry.listing);
  }

  private freshness(createdAt: Date) {
    const days = Math.max(
      0,
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, 100 - days * 2);
  }
}

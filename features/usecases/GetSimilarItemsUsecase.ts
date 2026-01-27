import type { Listing } from "@domain/entities/Listing";
import { RecommendationScorer } from "@domain/services/RecommendationScorer";
import type { ListingRepository } from "@repositories/ListingRepository";

export type GetSimilarItemsCommand = {
  listingId: string;
  limit: number;
};

export class GetSimilarItemsUsecase {
  private readonly scorer = new RecommendationScorer();

  constructor(private readonly listingRepository: ListingRepository) {}

  async execute(command: GetSimilarItemsCommand): Promise<Listing[]> {
    const source = await this.listingRepository.findById(command.listingId);
    if (!source) {
      return [];
    }

    const candidates = await this.listingRepository.getSimilarCandidates({
      listingId: command.listingId,
      limit: command.limit
    });

    const popularityMap = await this.listingRepository.getPopularityScores({
      listingIds: candidates.map((item) => item.id)
    });
    const maxPopularity = Math.max(
      1,
      ...Object.values(popularityMap),
      1
    );

    const scored = candidates.map((candidate) => ({
      listing: candidate,
      score: this.scorer.score({
        source,
        candidate,
        popularityScore:
          ((popularityMap[candidate.id] ?? 0) / maxPopularity) * 100,
        freshnessScore: this.freshness(candidate.createdAt)
      })
    }));

    return scored
      .sort((a, b) => b.score - a.score)
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

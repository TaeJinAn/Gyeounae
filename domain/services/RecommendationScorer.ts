import { Listing } from "../entities/Listing";

export type RecommendationScoreCommand = {
  source: Listing;
  candidate: Listing;
  popularityScore: number;
  freshnessScore: number;
};

export class RecommendationScorer {
  score(command: RecommendationScoreCommand) {
    const { source, candidate, popularityScore, freshnessScore } = command;
    const similarity =
      this.match(source.sport === candidate.sport) * 0.1 +
      this.match(source.category === candidate.category) * 0.25 +
      this.match(source.gender === candidate.gender) * 0.1 +
      this.match(source.brand === candidate.brand) * 0.2 +
      this.match(source.sizeLabel === candidate.sizeLabel) * 0.2 +
      this.match(source.condition === candidate.condition) * 0.05 +
      this.priceBucketSimilarity({
        source: source.price.amount,
        candidate: candidate.price.amount
      }) * 0.1;

    return similarity * 0.6 + popularityScore * 0.2 + freshnessScore * 0.2;
  }

  private match(condition: boolean) {
    return condition ? 100 : 0;
  }

  private priceBucketSimilarity(command: { source: number; candidate: number }) {
    if (command.source <= 0 || command.candidate <= 0) {
      return 0;
    }
    const bucketSize = 50000;
    const sourceBucket = Math.floor(command.source / bucketSize);
    const candidateBucket = Math.floor(command.candidate / bucketSize);
    const diff = Math.abs(sourceBucket - candidateBucket);
    if (diff === 0) return 100;
    if (diff === 1) return 70;
    if (diff === 2) return 40;
    return 0;
  }
}

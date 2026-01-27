export type ItemCondition =
  | "new"
  | "like-new"
  | "good"
  | "fair"
  | "for-parts";

export const conditionLabels: Record<ItemCondition, string> = {
  new: "condition.new",
  "like-new": "condition.like-new",
  good: "condition.good",
  fair: "condition.fair",
  "for-parts": "condition.for-parts"
};

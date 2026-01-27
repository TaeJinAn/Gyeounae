import type { Sport } from "./Sport";

export type SkiCategory =
  | "boots"
  | "clothing"
  | "plate"
  | "poles"
  | "helmet"
  | "accessories"
  | "others";

export type SnowboardCategory =
  | "boots"
  | "clothing"
  | "deck"
  | "helmet"
  | "accessories"
  | "others";

export type ListingCategory = SkiCategory | SnowboardCategory;

export const categoryLabels: Record<ListingCategory, string> = {
  boots: "category.boots",
  clothing: "category.clothing",
  plate: "category.plate",
  poles: "category.poles",
  helmet: "category.helmet",
  accessories: "category.accessories",
  others: "category.others",
  deck: "category.deck"
};

export const categoriesBySport: Record<Sport, ListingCategory[]> = {
  ski: ["boots", "plate", "poles", "helmet", "accessories", "clothing", "others"],
  snowboard: ["boots", "deck", "helmet", "accessories", "clothing", "others"]
};

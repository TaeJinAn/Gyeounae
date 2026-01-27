import type { Listing } from "@domain/entities/Listing";

export type MyItemsCommand = {
  userId: string;
};

export type CreateMyItemCommand = {
  itemId: string;
  userId: string;
  title: string;
  description: string;
  sport: string;
  itemType: string;
  gender: string;
  brandId: string;
  sizeType: string;
  sizeValue: string;
  price: number;
  region: string;
  tradeMethod: string;
  condition: string;
  imageUrls: string[];
  isHidden: boolean;
};

export type UpdateMyItemCommand = {
  itemId: string;
  userId: string;
  title: string;
  description: string;
  sport: string;
  itemType: string;
  gender: string;
  brandId: string;
  sizeType: string;
  sizeValue: string;
  price: number;
  region: string;
  tradeMethod: string;
  condition: string;
  isHidden: boolean;
  imageUrls: string[];
};

export type UpdateMyItemStatusCommand = {
  itemId: string;
  userId: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
};

export type DeleteMyItemCommand = {
  itemId: string;
  userId: string;
};

export interface MyItemRepository {
  findAll(command: MyItemsCommand): Promise<Listing[]>;
  create(command: CreateMyItemCommand): Promise<void>;
  update(command: UpdateMyItemCommand): Promise<void>;
  updateStatus(command: UpdateMyItemStatusCommand): Promise<void>;
  softDelete(command: DeleteMyItemCommand): Promise<void>;
}

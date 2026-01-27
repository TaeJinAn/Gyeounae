import type { Gender } from "../value-objects/Gender";
import type { ListingCategory } from "../value-objects/ListingCategory";
import type { Money } from "../value-objects/Money";
import type { Sport } from "../value-objects/Sport";
import type { ItemCondition } from "../value-objects/ItemCondition";
import { FootProfile } from "../value-objects/FootProfile";

export type ListingVisibility = "visible" | "hidden" | "deleted";
export type ListingStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export type ListingProps = {
  id: string;
  title: string;
  description?: string;
  sport: Sport;
  category: ListingCategory;
  gender: Gender;
  brand: string;
  sizeLabel: string;
  region?: string;
  tradeMethod?: string;
  price: Money;
  condition: ItemCondition;
  visibility: ListingVisibility;
  status: ListingStatus;
  sellerId: string;
  createdAt: Date;
  primaryImageUrl?: string;
  sellerFootProfile?: FootProfile;
  viewCount?: number;
  favoriteCount?: number;
};

export class Listing {
  private constructor(private readonly props: ListingProps) {}

  static create(props: ListingProps) {
    return new Listing(props);
  }

  get id() {
    return this.props.id;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get sport() {
    return this.props.sport;
  }

  get category() {
    return this.props.category;
  }

  get gender() {
    return this.props.gender;
  }

  get brand() {
    return this.props.brand;
  }

  get sizeLabel() {
    return this.props.sizeLabel;
  }

  get region() {
    return this.props.region;
  }

  get tradeMethod() {
    return this.props.tradeMethod;
  }

  get price() {
    return this.props.price;
  }

  get condition() {
    return this.props.condition;
  }

  get visibility() {
    return this.props.visibility;
  }

  get status() {
    return this.props.status;
  }

  get sellerId() {
    return this.props.sellerId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get primaryImageUrl() {
    return this.props.primaryImageUrl;
  }

  get sellerFootProfile() {
    return this.props.sellerFootProfile;
  }

  get viewCount() {
    return this.props.viewCount ?? 0;
  }

  get favoriteCount() {
    return this.props.favoriteCount ?? 0;
  }

  canBeShown() {
    return this.props.visibility === "visible";
  }
}

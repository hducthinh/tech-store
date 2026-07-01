import type { User } from "./user";
import type { Product } from "./product";

export interface Review {
  _id: string;
  product: Product | string;
  user: User;
  rating: number;
  comment: string;
  createdAt?: string;
}

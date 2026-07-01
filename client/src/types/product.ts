import type { ProductStatus } from "@/constants";
import type { Category } from "./category";
import type { Brand } from "./brand";
import type { Review } from "./review";

export interface ProductFeature {
  name: string;
  value: string;
  _id?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  thumbnail: string;
  images: string[];
  category: Category | string;
  brand: Brand | string;
  status: ProductStatus;
  features: ProductFeature[];
  specifications: Record<string, string>;
  averageRating: number;
  reviewCount: number;
  reviews?: Review[];
  createdAt?: string;
}

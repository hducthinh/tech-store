export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  productCount?: number;
}

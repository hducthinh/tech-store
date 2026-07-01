import type { Product } from "./product";

export interface CartItem {
  productId: Product;
  quantity: number;
  buildId?: string;
  _id?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

import type { User } from "./user";
import type { Product } from "./product";
import type { OrderStatus, PaymentStatus } from "@/constants";

export interface OrderItem {
  productId: Product;
  quantity: number;
  price: number;
  buildId?: string;
  _id?: string;
}

export interface Order {
  _id: string;
  user: User;
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: string;
  phone: string;
  status: OrderStatus;
  paymentMethod: "COD" | "MOMO" | "VNPAY";
  paymentStatus: PaymentStatus;
  createdAt?: string;
}

export const USER_ROLE = {
  USER: "user",
  ADMIN: "admin",
} as const;
export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  FAILED: "failed",
} as const;
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DRAFT: "draft",
} as const;
export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];

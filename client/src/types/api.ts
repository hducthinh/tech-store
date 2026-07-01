export type ApiResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; data?: null };

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type PaginatedResult<T> = ApiResult<PaginatedData<T>>;

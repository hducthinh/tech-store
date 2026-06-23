import React from "react";
import { Search, Loader2, HelpCircle, ArrowRight } from "lucide-react";
import { Product } from "../../types";
import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";

interface CatalogProps {
  products: Product[];
  loadingProducts: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categoriesDb: { _id: string; name: string }[];
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToAi: () => void;
  page: number;
  setPage: (page: any) => void;
  totalPages: number;
  error?: string | null;
}

export function Catalog({
  products,
  loadingProducts,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categoriesDb,
  onAddToCart,
  onSelectProduct,
  onNavigateToAi,
  page,
  setPage,
  totalPages,
  error
}: CatalogProps) {

  const getPaginationRange = () => {
    const total = totalPages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, '...', total];
    if (page >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
    return [1, '...', page - 1, page, page + 1, '...', total];
  };

  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto p-4 md:p-8 flex flex-col gap-6">

      {/* Floating AI Button */}
      <button
        onClick={onNavigateToAi}
        className="fixed bottom-6 right-6 z-50 bg-[#00236f] text-white p-4 rounded-full shadow-2xl hover:bg-amber-400 hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer group"
        title="Nhận tư vấn cấu hình với AI"
      >
        <HelpCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
        {/* Category Filter Pills on Top */}
        <div className="flex flex-wrap gap-2.5 w-full pb-2">
          {[{ _id: "All", name: "Tất cả sản phẩm" }, ...categoriesDb].map(c => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition cursor-pointer whitespace-nowrap ${selectedCategory === c._id ? "bg-[#00236f] border-[#00236f] text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"}`}
            >
              {c.name}
            </button>
          ))}
        </div>


      </div>

      {/* Catalog content section */}
      {loadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 && !error ? (
        <div className="flex-1 text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-bold text-slate-700">Không tìm thấy sản phẩm phù hợp</p>
          <p className="text-sm text-slate-400 mt-1">Thử nhập từ khóa khác hoặc trò chuyện với Trợ lý AI để yêu cầu nhập hàng.</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
          >
            Thiết lập lại tìm kiếm
          </button>
        </div>
      ) : error ? (
        <div className="flex-1 text-center py-20 bg-white rounded-2xl border border-red-200 bg-red-50">
          <p className="text-lg font-bold text-red-600 mb-2">Đã xảy ra lỗi</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
              onNavigateToAi={onNavigateToAi}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {!loadingProducts && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage((p: number) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Trang trước
          </button>

          <div className="flex items-center gap-1">
            {getPaginationRange().map((item, index) => (
              <button
                key={index}
                onClick={() => typeof item === 'number' && setPage(item)}
                disabled={item === '...'}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                  item === '...' 
                    ? "bg-transparent text-slate-400 cursor-default" 
                    : page === item
                      ? "bg-[#00236f] text-white shadow-md cursor-pointer"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}

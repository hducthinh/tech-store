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
  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto p-4 md:p-8 flex flex-col gap-6">

      {/* Hero promo banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#00236f] text-white p-8 md:p-12 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 max-w-xl space-y-4">
          <h2 className="text-3xl md:text-5xl font-sans font-extrabold tracking-tight leading-tight">
            Nâng tầm <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Hiệu Suất</span>
          </h2>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed max-w-md">
            Bạn gặp khó khăn khi lựa chọn linh kiện phù hợp với ngân sách và nhu cầu công việc? Hãy thử tham khảo ý kiến với trợ lý AI ngay!
          </p>
        </div>
        <button
          onClick={onNavigateToAi}
          className="relative z-10 bg-white text-[#00236f] hover:bg-amber-400 hover:text-slate-900 transition font-semibold text-xs px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
        >
          Nhận tư vấn cấu hình với AI
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Background abstract overlay element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-12 -translate-y-12"></div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
        {/* Category Filter Pills on Top */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none w-full xl:w-auto">
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
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${page === i + 1
                    ? "bg-[#00236f] text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {i + 1}
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

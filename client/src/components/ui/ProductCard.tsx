import React from "react";
import { Product } from "../../types";
import { ShoppingCart, MessageSquare, Database, Laptop, Tv, Cpu, Terminal } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToAi: () => void;
}

export function ProductCard({ product, onAddToCart, onSelectProduct, onNavigateToAi }: ProductCardProps) {
  // Helper category icons mapping
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case "Workstation": return <Database className="w-5 h-5 text-indigo-600" />;
      case "Laptop": return <Laptop className="w-5 h-5 text-blue-600" />;
      case "Monitors": return <Tv className="w-5 h-5 text-emerald-600" />;
      case "Components": return <Cpu className="w-5 h-5 text-orange-600" />;
      default: return <Terminal className="w-5 h-5 text-slate-600" />;
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const inStock = product.specs.includes("Còn ") || !product.specs.includes("Hết hàng");

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Header product tag */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            {renderCategoryIcon(product.category)}
            {product.category}
          </span>
          {inStock ? (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Còn hàng</span>
          ) : (
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Liên hệ đặt</span>
          )}
        </div>

        <h4 
          onClick={() => onSelectProduct(product)}
          className="text-base font-bold text-slate-800 line-clamp-2 hover:text-[#0058be] transition cursor-pointer leading-tight mb-2"
        >
          {product.name}
        </h4>
        
        <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2.5 rounded border border-slate-100/50 line-clamp-3 mb-3">
          {product.specs}
        </p>

        <p className="text-xs text-slate-400 line-clamp-2 mt-auto">
          {product.description}
        </p>
      </div>

      {/* Pricing footer block */}
      <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-slate-400 font-medium">Giá sản phẩm</span>
          <span className="text-base font-display font-extrabold text-[#ba1a1a]">{formatVND(product.price)}</span>
        </div>
        
        <button
          onClick={() => inStock ? onAddToCart(product) : onNavigateToAi()}
          className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer ${inStock ? "bg-[#0058be] hover:bg-[#00236f] text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"}`}
        >
          {inStock ? (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              Thêm vào giỏ
            </>
          ) : (
            <>
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              Nhờ AI đặt chế tạo
            </>
          )}
        </button>
      </div>
    </div>
  );
}

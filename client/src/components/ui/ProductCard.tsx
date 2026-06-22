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
  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const originalPrice = product.originalPrice || (product.price * 1.15); // Fake original price if not present
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div 
      className="bg-white rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
      onClick={() => onSelectProduct(product)}
    >
      {/* Product Image */}
      <div className="w-full aspect-square bg-white flex items-center justify-center overflow-hidden relative p-4">
        <img 
          src={product.images?.[0] || product.thumbnail || `https://placehold.co/600x600/f8f9fa/334155?text=${encodeURIComponent(product.name)}`} 
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
        />
      </div>

      {/* Body */}
      <div className="p-4 flex-grow flex flex-col justify-end">
        <h4 className="text-[15px] font-semibold text-slate-800 line-clamp-2 leading-snug mb-3 hover:text-[#0058be]">
          {product.name}
        </h4>
        
        {/* Pricing */}
        <div className="flex flex-col gap-0.5 mb-2">
          {discountPercent > 0 ? (
            <span className="text-sm text-slate-400 line-through">{formatVND(originalPrice)}</span>
          ) : (
            <span className="text-sm text-transparent select-none">No discount</span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#ba1a1a]">{formatVND(product.price)}</span>
            {discountPercent > 0 && (
              <span className="text-xs font-semibold text-[#ba1a1a] bg-red-50 border border-red-200 px-1 rounded">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-auto">
          <span className="text-sm font-bold text-amber-500">{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
          <span className="text-amber-500 text-xs">⭐</span>
          <span className="text-sm text-slate-500">({product.reviewCount || 0} đánh giá)</span>
        </div>
      </div>
    </div>
  );
}

// src/components/products/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
      <div className="p-2">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.thumbnail || product.images?.[0] || "https://placehold.co/400x400?text=No+Image"}
            alt={product.name}
            className="w-full h-48 object-cover rounded-md transition-transform hover:scale-105"
          />
        </Link>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 mb-2">
            {product.name}
          </h3>
        </Link>
        {product.specifications && product.specifications.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.specifications.slice(0, 3).map((spec, index) => (
              <span key={index} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                {spec.value || spec.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <span className="text-red-600 font-bold text-lg block">
              {product.price.toLocaleString("vi-VN")} ₫
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 line-through text-sm">
                {product.originalPrice.toLocaleString("vi-VN")} ₫
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-yellow-400 text-sm flex items-center">
            <span className="text-gray-700 font-bold mr-1 text-xs">{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
            {"★".repeat(Math.round(product.rating || 0))}
            {"☆".repeat(5 - Math.round(product.rating || 0))}
            <span className="text-gray-400 ml-1 text-xs">({product.reviewCount || 0})</span>
          </div>
          <button className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded transition font-medium">
            Thêm giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

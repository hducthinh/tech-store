import React from "react";

export default function ProductGallery({ product, mainImage, setMainImage }) {
  return (
    <div className="w-full md:w-1/2">
      <div className="rounded-xl overflow-hidden bg-[#f8f9fc] flex items-center justify-center p-6 aspect-square mb-4">
        <img
          src={mainImage || "https://placehold.co/600x600?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-contain max-h-[400px]"
        />
      </div>
      
      {product.images && product.images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {product.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(img)}
              className={`w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition focus:outline-none ${
                mainImage === img ? "border-red-600 ring-1 ring-red-600" : "border-gray-200 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover bg-white" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

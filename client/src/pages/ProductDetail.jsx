import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

import ProductGallery from "../components/products/ProductGallery";
import ProductReviews from "../components/products/ProductReviews";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");

  const [addingToCart, setAddingToCart] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  
  const [reviews, setReviews] = useState([]);

  useDocumentMeta(
    product ? product.name : "Đang tải...",
    product ? (product.description?.substring(0, 150) + "...") : "Chi tiết sản phẩm TechStore"
  );

  const fetchReviews = async (productId) => {
    try {
      const res = await api.get(`/reviews/${productId}`);
      setReviews(res.data.data.reviews);
    } catch (err) {
      console.error("Lỗi lấy danh sách đánh giá", err);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        const p = res.data.data.product;
        // Sử dụng ảnh thực tế, gộp thumbnail vào list images nếu có
        const actualImages = [];
        if (p.thumbnail) actualImages.push(p.thumbnail);
        if (p.images && p.images.length > 0) {
            actualImages.push(...p.images.filter(img => img !== p.thumbnail));
        }
        
        if (actualImages.length === 0) {
            actualImages.push("https://placehold.co/600x600/f8f9fa/334155?text=No+Image");
        }
        
        p.images = actualImages;
        setProduct(p);
        setMainImage(actualImages[0]);
        
        // Lấy danh sách đánh giá
        fetchReviews(p._id);
        fetchSimilarProducts(slug);
      } catch (err) {
        console.error("fetchDetail error:", err);
        setError(`Không tìm thấy sản phẩm hoặc có lỗi kết nối. Chi tiết: ${err.message || err}`);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchSimilarProducts = async (productSlug) => {
      try {
        const res = await api.get(`/products/${productSlug}/similar`);
        setSimilarProducts(res.data.data.products);
      } catch (err) {
        console.error("Lỗi lấy sản phẩm tương tự", err);
      }
    };
    fetchDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 bg-white rounded-lg border border-gray-100 shadow-sm mt-8">
        <p className="text-red-500 text-lg">{error}</p>
        <button onClick={() => navigate("/")} className="mt-4 text-blue-600 hover:underline">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    setAddingToCart(true);
    setAddSuccess(false);
    try {
      await api.post("/cart", { productId: product._id || product.id, quantity });
      setAddSuccess(true);
      window.dispatchEvent(new Event("cartUpdated"));
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen px-4 md:px-8 pb-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2 mb-6 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Quay lại
        </button>

        <div className="flex flex-col lg:flex-row gap-6 items-start mb-10">
          {/* Cột trái: Ảnh và Thông tin */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Hình ảnh */}
                <ProductGallery product={product} mainImage={mainImage} setMainImage={setMainImage} />

                {/* Thông tin chi tiết */}
                <div className="w-full md:w-1/2 flex flex-col">
                  <div className="flex items-center gap-3 text-sm mb-3">
                    <span className="bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded text-xs">{product.brandId?.name || "TechStore"}</span>
                    <span className="text-gray-500 font-medium text-xs">SKU: {product.sku || "N/A"}</span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">{product.name}</h1>
                  
                  <div className="flex items-baseline gap-3 mb-5 border-b border-gray-100 pb-5">
                    <span className="text-3xl font-bold text-[#0b5cbe]">
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-gray-400 line-through text-base">
                        {product.originalPrice.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                  </div>

                  <div className="text-gray-600 mb-8 leading-relaxed text-sm">
                    <p>{product.shortDescription || product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white h-11 w-28">
                        <button
                          className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 rounded-l-lg"
                          disabled={quantity <= 1}
                          onClick={() => setQuantity(q => q - 1)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-10 h-full text-center text-gray-900 font-semibold focus:outline-none text-sm"
                          min="1"
                          max={product.stock}
                        />
                        <button
                          className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 rounded-r-lg"
                          disabled={quantity >= product.stock}
                          onClick={() => setQuantity(q => q + 1)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                      </div>
                      <div className="flex flex-col ml-4">
                        <span className="text-xs text-slate-500 font-medium">Còn hàng</span>
                        <span className="text-sm font-bold text-[#802f2f]">{product.stock} sản phẩm</span>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0 || addingToCart || addSuccess}
                      className={`w-full text-white h-12 rounded-xl font-semibold text-base transition disabled:opacity-80 flex justify-center items-center gap-2 ${
                        addSuccess ? "bg-green-600 hover:bg-green-700" : "bg-[#0b5cbe] hover:bg-blue-800 shadow-sm"
                      }`}
                    >
                      {addingToCart ? (
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : addSuccess ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                      )}
                      {product.stock === 0 ? "HẾT HÀNG" : "Thêm vào giỏ"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* THÊM MỚI: Thông tin chi tiết sản phẩm */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                Thông tin chi tiết
              </h2>
              <div className="prose max-w-none text-gray-600">
                {product.description ? (
                   <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                ) : (
                   <p className="italic text-gray-400">Đang cập nhật...</p>
                )}
              </div>
            </div>

            {/* Phần Đánh giá & Bình luận (Reviews) */}
            <ProductReviews product={product} user={user} reviews={reviews} fetchReviews={fetchReviews} />

            {/* Phần Sản phẩm tương tự */}
            {similarProducts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  Sản phẩm tương tự
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarProducts.map((p) => {
                    const displayImage = p.images?.[0] || p.thumbnail || `https://placehold.co/600x600/f8f9fa/334155?text=${encodeURIComponent(p.name)}`;
                    return (
                      <div 
                        key={p._id} 
                        className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer"
                        onClick={() => navigate(`/products/${p.slug}`)}
                      >
                        <div className="w-full aspect-square bg-gray-50 p-4">
                          <img src={displayImage} alt={p.name} className="w-full h-full object-contain hover:scale-105 transition duration-300" />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm mb-2 hover:text-blue-600">
                            {p.name}
                          </h4>
                          <p className="text-red-600 font-bold">{p.price.toLocaleString("vi-VN")} ₫</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div> {/* Đóng left column lg:w-2/3 */}

          {/* Cột phải: Thông số kỹ thuật */}
          <div className="w-full lg:w-1/3">
            {product.specs && Object.keys(product.specs).length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Thông số kỹ thuật</h2>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm table-fixed">
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(product.specs).map(([key, value], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="py-3 px-3 md:px-4 font-semibold text-gray-800 w-1/3 md:w-2/5 break-words align-top">{key}</td>
                          <td className="py-3 px-3 md:px-4 text-gray-600 break-words">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-500 text-sm italic">
                Chưa có thông số kỹ thuật.
              </div>
            )}
          </div>

        </div> {/* Đóng flex-row container */}
      </div> {/* Đóng max-w-6xl */}
    </div>
  );
};

export default ProductDetail;

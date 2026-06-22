import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");

  const [addingToCart, setAddingToCart] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

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
        setProduct(p);
        setMainImage(p.thumbnail || p.images?.[0] || "");
        
        // Lấy danh sách đánh giá
        fetchReviews(p._id);
      } catch (err) {
        setError("Không tìm thấy sản phẩm hoặc có lỗi kết nối.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
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
        <button onClick={() => navigate("/products")} className="mt-4 text-blue-600 hover:underline">
          Quay lại danh sách sản phẩm
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
      await api.post("/cart", { productId: product._id, quantity });
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    
    setSubmittingReview(true);
    setReviewError("");
    try {
      await api.post(`/reviews/${product._id}`, {
        rating: reviewRating,
        comment: reviewComment
      });
      // Lấy lại danh sách sau khi đánh giá thành công
      await fetchReviews(product._id);
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      setReviewError(err?.response?.data?.message || "Có lỗi khi gửi đánh giá.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-6 transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Quay lại
      </button>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Hình ảnh */}
        <div className="w-full lg:w-1/2">
          <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-4 aspect-square mb-4">
            <img
              src={mainImage || "https://placehold.co/600x600?text=No+Image"}
              alt={product.name}
              className="w-full h-full object-contain max-h-[500px]"
            />
          </div>
          
          {product.images && product.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumbnail-${idx}`}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 transition ${
                    mainImage === img ? "border-blue-600 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thông tin chi tiết */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span>Thương hiệu: <strong className="text-blue-600">{product.brandId?.name || "Đang cập nhật"}</strong></span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>SKU: {product.sku || "N/A"}</span>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-end gap-3">
              <span className="text-3xl md:text-4xl font-bold text-red-600">
                {product.price.toLocaleString("vi-VN")} ₫
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-gray-400 line-through text-lg mb-1">
                  {product.originalPrice.toLocaleString("vi-VN")} ₫
                </span>
              )}
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-gray-600 mb-8 leading-relaxed">
            <p>{product.shortDescription || product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>
          </div>

          <div className="mt-auto border-t border-gray-100 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">Số lượng:</label>
                <div className="flex items-center border border-gray-200 rounded-md bg-white">
                  <button
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition disabled:opacity-30"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => q - 1)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 h-10 text-center text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition disabled:opacity-30"
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </button>
                </div>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                Sẵn có: <strong className="text-gray-700">{product.stock}</strong>
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart || addSuccess}
                className={`flex-1 text-white px-8 py-3.5 rounded-lg font-semibold transition disabled:opacity-80 disabled:cursor-not-allowed shadow-sm flex justify-center items-center gap-2 ${
                  addSuccess ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                )}
                
                {product.stock === 0 
                  ? "TẠM HẾT HÀNG" 
                  : addingToCart 
                    ? "ĐANG THÊM..." 
                    : addSuccess 
                      ? "ĐÃ THÊM VÀO GIỎ" 
                      : "THÊM VÀO GIỎ HÀNG"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Phần Thông số kỹ thuật (Specs) */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Thông số kỹ thuật
          </h2>
          <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden w-full lg:w-2/3">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {Object.entries(product.specs).map(([key, value], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3.5 px-5 font-medium text-gray-600 w-1/3 sm:w-1/4 border-r border-gray-100">{key}</td>
                    <td className="py-3.5 px-5 text-gray-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Phần Đánh giá & Bình luận (Reviews) */}
      <div className="mt-16 border-t border-gray-100 pt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
          Đánh giá & Bình luận
        </h2>

        {/* Danh sách bình luận */}
        <div className="space-y-6 mb-10">
          {reviews.length === 0 ? (
            <p className="text-gray-500 italic">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          ) : (
            reviews.map((rv) => (
              <div key={rv._id} className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                      {rv.user?.fullName?.substring(0, 2) || rv.user?.name?.substring(0, 2) || "KH"}
                    </div>
                    <span className="font-semibold text-gray-800">{rv.user?.fullName || rv.user?.name || "Khách hàng ẩn danh"}</span>
                  </div>
                  <div className="text-yellow-400 text-sm flex items-center">
                    {"★".repeat(rv.rating)}
                    {"☆".repeat(5 - rv.rating)}
                  </div>
                </div>
                <p className="text-gray-600 ml-10 whitespace-pre-line">{rv.comment}</p>
                <div className="text-xs text-gray-400 ml-10 mt-2">
                  {new Date(rv.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form viết đánh giá */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Viết đánh giá của bạn</h3>
          
          {!user ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-3">Bạn cần đăng nhập để viết đánh giá.</p>
              <button 
                onClick={() => navigate("/login")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview}>
              {reviewError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {reviewError}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl focus:outline-none transition-colors ${
                        star <= reviewRating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500 font-medium">
                    {reviewRating === 5 ? "Tuyệt vời" : reviewRating === 4 ? "Tốt" : reviewRating === 3 ? "Bình thường" : reviewRating === 2 ? "Tệ" : "Rất tệ"}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung đánh giá</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview || !reviewComment.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  "Gửi đánh giá"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

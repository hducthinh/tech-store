import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

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

  useDocumentMeta(
    product ? product.name : "Đang tải...",
    product ? (product.description?.substring(0, 150) + "...") : "Chi tiết sản phẩm TechStore"
  );

  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]); // State for UI preview of attached images
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
      } catch (err) {
        console.error("fetchDetail error:", err);
        setError(`Không tìm thấy sản phẩm hoặc có lỗi kết nối. Chi tiết: ${err.message || err}`);
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
      await api.post("/cart", { productId: product._id, quantity });
      setAddSuccess(true);
      window.dispatchEvent(new Event("cartUpdated"));
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
      const formData = new FormData();
      formData.append("rating", reviewRating);
      formData.append("comment", reviewComment);
      
      // Thêm các file ảnh vào formData
      reviewImages.forEach((imgObj) => {
        formData.append("images", imgObj.file);
      });

      await api.post(`/reviews/${product._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      // Lấy lại danh sách sau khi đánh giá thành công
      await fetchReviews(product._id);
      setReviewComment("");
      setReviewRating(5);
      setReviewImages([]);
    } catch (err) {
      setReviewError(err?.response?.data?.message || "Có lỗi khi gửi đánh giá.");
    } finally {
      setSubmittingReview(false);
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
          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Hình ảnh */}
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
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500">Stock</span>
                      <span className="text-sm font-bold text-[#802f2f]">{product.stock} units</span>
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

          {/* Cột phải: Thông số kỹ thuật */}
          <div className="w-full lg:w-1/3">
            {product.specs && Object.keys(product.specs).length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Thông số kỹ thuật</h2>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(product.specs).map(([key, value], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="py-3 px-4 font-semibold text-gray-800 w-1/3">{key}</td>
                          <td className="py-3 px-4 text-gray-600">{value}</td>
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
        </div>

      {/* Phần Đánh giá & Bình luận (Reviews) */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-10">
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
                
                {/* Hình ảnh đính kèm (Mock UI) */}
                {rv.images && rv.images.length > 0 && (
                  <div className="ml-10 mt-3 flex flex-wrap gap-2">
                    {rv.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`review-img-${idx}`} className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-400 ml-10 mt-3">
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

              {/* Phần đính kèm hình ảnh */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Đính kèm hình ảnh (tùy chọn)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (reviewImages.length + files.length > 5) {
                      alert("Tối đa 5 ảnh đính kèm.");
                      return;
                    }
                    const newImages = files.map(file => ({
                      file,
                      preview: URL.createObjectURL(file)
                    }));
                    setReviewImages(prev => [...prev, ...newImages]);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {reviewImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {reviewImages.map((imgObj, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                        <img src={imgObj.preview} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setReviewImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
    </div>
  );
};

export default ProductDetail;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ProductReviews({ product, user, reviews, fetchReviews }) {
  const navigate = useNavigate();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    
    setSubmittingReview(true);
    setReviewError("");
    try {
      const formData = new FormData();
      formData.append("rating", reviewRating);
      formData.append("comment", reviewComment);
      
      reviewImages.forEach((imgObj) => {
        formData.append("images", imgObj.file);
      });

      await api.post(`/reviews/${product._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
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
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
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
  );
}

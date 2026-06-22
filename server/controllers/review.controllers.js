import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// @desc    Lấy tất cả bình luận của 1 sản phẩm
// @route   GET /api/v1/reviews/:productId
// @access  Public
export const getProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  // Lấy reviews và populate tên user
  const reviews = await Review.find({ product: productId })
    .populate({
      path: "user",
      select: "fullName email",
    })
    .sort("-createdAt"); // Mới nhất lên đầu

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// @desc    Viết bình luận & đánh giá mới
// @route   POST /api/v1/reviews/:productId
// @access  Private
export const createReview = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.userId; // Lấy từ verifyToken

  // 1. Kiểm tra sản phẩm có tồn tại không
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Không tìm thấy sản phẩm này", 404));
  }

  // 2. Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
  // Do có Compound Index nên MongoDB cũng sẽ tự throw error E11000,
  // nhưng kiểm tra thủ công sẽ trả về thông báo lỗi thân thiện hơn
  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) {
    return next(new AppError("Bạn đã đánh giá sản phẩm này rồi", 400));
  }

  // 2.5 Kiểm tra xem user đã mua sản phẩm này chưa (có đơn hàng chứa sản phẩm này)
  const hasPurchased = await Order.findOne({
    userId,
    "items.productId": productId
  });

  if (!hasPurchased) {
    return next(new AppError("Bạn phải mua sản phẩm này mới có thể đánh giá.", 403));
  }

  // 3. Tạo Review
  const newReview = await Review.create({
    rating,
    comment,
    product: productId,
    user: userId,
  });

  // Tự động trigger post('save') middleware trong model để update rating & reviewCount cho Product

  // Trả về Review kèm User để frontend tiện hiển thị luôn
  const populatedReview = await Review.findById(newReview._id).populate({
    path: "user",
    select: "fullName email",
  });

  res.status(201).json({
    status: "success",
    message: "Đánh giá của bạn đã được ghi nhận",
    data: {
      review: populatedReview,
    },
  });
});

// (Tùy chọn: updateReview, deleteReview có thể được thêm sau nếu cần thiết)

import mongoose from "mongoose";
import Product from "./product.model.js";

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Vui lòng cung cấp số sao đánh giá (1-5)"],
    },
    comment: {
      type: String,
      trim: true,
      required: [true, "Vui lòng nhập nội dung đánh giá"],
      maxlength: [1000, "Nội dung đánh giá không được vượt quá 1000 ký tự"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Đánh giá phải thuộc về một sản phẩm cụ thể"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Đánh giá phải được thực hiện bởi một người dùng"],
    },
  },
  {
    timestamps: true,
  }
);

// Ràng buộc: Mỗi người dùng chỉ được đánh giá 1 lần cho 1 sản phẩm
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Hàm tính toán trung bình cộng sao và tổng số lượt đánh giá
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 }, // Đếm tổng số lượng review
        avgRating: { $avg: "$rating" }, // Tính trung bình cộng của field rating
      },
    },
  ]);

  if (stats.length > 0) {
    // Cập nhật vào Collection Product
    await Product.findByIdAndUpdate(productId, {
      reviewCount: stats[0].nRating,
      rating: Math.round(stats[0].avgRating * 10) / 10, // Làm tròn 1 chữ số thập phân
    });
  } else {
    // Nếu không còn đánh giá nào, reset về 0
    await Product.findByIdAndUpdate(productId, {
      reviewCount: 0,
      rating: 0,
    });
  }
};

// Gọi hàm tính toán SAU KHI lưu đánh giá mới
reviewSchema.post("save", function () {
  // this.constructor trỏ đến Model Review hiện tại
  this.constructor.calcAverageRatings(this.product);
});

// Xử lý khi UPDATE hoặc DELETE (findOneAnd...)
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Gắn document hiện tại vào this để truyền sang middleware post
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    // await this.findOne(); KHÔNG work ở đây vì query đã execute rồi
    await this.r.constructor.calcAverageRatings(this.r.product);
  }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;

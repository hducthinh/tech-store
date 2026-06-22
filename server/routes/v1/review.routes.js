import express from "express";
import {
  getProductReviews,
  createReview,
} from "../../controllers/review.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";

const router = express.Router();

// Lấy danh sách bình luận (Public)
router.get("/:productId", getProductReviews);

// Viết đánh giá (Yêu cầu đăng nhập)
router.post("/:productId", verifyToken, createReview);

export default router;

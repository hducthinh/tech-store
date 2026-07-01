import express from "express";
import {
  getProductReviews,
  createReview,
} from "../../controllers/review.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";
import upload from "../../utils/upload.js";

const router = express.Router();

// Lấy danh sách bình luận (Public)
router.get("/:productId", getProductReviews);

// Viết đánh giá (Yêu cầu đăng nhập)
router.post("/:productId", verifyToken, upload.array("images", 5), createReview);

export default router;


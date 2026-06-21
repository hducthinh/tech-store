import express from "express";
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/category.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";

const router = express.Router();

// Public
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

// Admin (ponytail: chỉ verifyToken, thêm role check khi cần)
router.post("/", verifyToken, createCategory);
router.patch("/:id", verifyToken, updateCategory);
router.delete("/:id", verifyToken, deleteCategory);

export default router;

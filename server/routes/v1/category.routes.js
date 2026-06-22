import express from "express";
import {
  getCategories,
  getAdminCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/category.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";

const router = express.Router();

// Admin
router.get("/admin", verifyToken, verifyAdmin, getAdminCategories);
router.post("/", verifyToken, verifyAdmin, createCategory);
router.patch("/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/:id", verifyToken, verifyAdmin, deleteCategory);

// Public
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

export default router;

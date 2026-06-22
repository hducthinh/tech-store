import express from "express";
import {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../controllers/brand.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";

const router = express.Router();

// Public
router.get("/", getBrands);
router.get("/:slug", getBrandBySlug);

// Admin (ponytail: chỉ verifyToken, thêm role check khi cần)
router.post("/", verifyToken, createBrand);
router.patch("/:id", verifyToken, updateBrand);
router.delete("/:id", verifyToken, deleteBrand);

export default router;

import express from "express";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";
import upload from "../../utils/upload.js";
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../../controllers/product.controllers.js";

const router = express.Router();

// Admin Routes
router.get("/admin", verifyToken, verifyAdmin, getAdminProducts);
router.post("/", verifyToken, verifyAdmin, upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "images", maxCount: 5 }]), createProduct);
router.patch("/:id", verifyToken, verifyAdmin, upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "images", maxCount: 5 }]), updateProduct);
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

// Public Routes
// Note: Các route tĩnh (static) phải đặt trước các route động (dynamic)
router.get("/featured", getFeaturedProducts);
router.get("/:slug", getProductBySlug);
router.get("/", getProducts);

export default router;

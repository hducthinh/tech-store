import express from "express";
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
} from "../../controllers/product.controllers.js";

const router = express.Router();

// Note: Các route tĩnh (static) phải đặt trước các route động (dynamic)
router.get("/featured", getFeaturedProducts);
router.get("/:slug", getProductBySlug);
router.get("/", getProducts);

export default router;

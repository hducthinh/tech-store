import express from "express";
import {
  getBrands,
  getAdminBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../controllers/brand.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";

const router = express.Router();

// Admin
router.get("/admin", verifyToken, verifyAdmin, getAdminBrands);
router.post("/", verifyToken, verifyAdmin, createBrand);
router.patch("/:id", verifyToken, verifyAdmin, updateBrand);
router.delete("/:id", verifyToken, verifyAdmin, deleteBrand);

// Public
router.get("/", getBrands);
router.get("/:slug", getBrandBySlug);

export default router;


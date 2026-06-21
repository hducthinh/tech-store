import express from "express";
import authRoutes from "./v1/auth.routes.js";
import productRoutes from "./v1/product.routes.js";

const router = express.Router();

router.use("/v1/auth", authRoutes);
router.use("/v1/products", productRoutes);

export default router;

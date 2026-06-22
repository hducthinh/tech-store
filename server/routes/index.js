import express from "express";
import authRoutes from "./v1/auth.routes.js";
import productRoutes from "./v1/product.routes.js";
import categoryRoutes from "./v1/category.routes.js";
import brandRoutes from "./v1/brand.routes.js";
import cartRoutes from "./v1/cart.routes.js";
import orderRoutes from "./v1/order.routes.js";
import dashboardRoutes from "./v1/dashboard.routes.js";

const router = express.Router();

router.use("/v1/auth", authRoutes);
router.use("/v1/products", productRoutes);
router.use("/v1/categories", categoryRoutes);
router.use("/v1/brands", brandRoutes);
router.use("/v1/cart", cartRoutes);
router.use("/v1/orders", orderRoutes);
router.use("/v1/dashboard", dashboardRoutes);

export default router;

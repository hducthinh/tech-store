import express from "express";
import { createOrder, getMyOrders, getAdminOrders, updateOrderStatus, cancelOrder } from "../../controllers/order.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";

const router = express.Router();

router.use(verifyToken);

// Admin Routes
router.get("/admin", verifyAdmin, getAdminOrders);
router.patch("/admin/:id/status", verifyAdmin, updateOrderStatus);

// Customer Routes
router.route("/")
  .post(createOrder)
  .get(getMyOrders);

router.post("/:id/cancel", cancelOrder);

export default router;

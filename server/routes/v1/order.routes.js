import express from "express";
import { createOrder, getMyOrders, getOrderById, getAdminOrders, updateOrderStatus, cancelOrder, confirmPayment } from "../../controllers/order.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";

const router = express.Router();

router.use(verifyToken);

// Admin Routes
router.get("/admin", verifyAdmin, getAdminOrders);
router.patch("/admin/:id/status", verifyAdmin, updateOrderStatus);
router.patch("/admin/:id/confirm-payment", verifyAdmin, confirmPayment);

// Customer Routes
router.route("/")
  .post(createOrder)
  .get(getMyOrders);

router.get("/:id", getOrderById);
router.post("/:id/cancel", cancelOrder);

export default router;

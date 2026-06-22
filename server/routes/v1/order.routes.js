import express from "express";
import { createOrder, getMyOrders } from "../../controllers/order.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";

const router = express.Router();

router.use(verifyToken);

router.route("/")
  .post(createOrder)
  .get(getMyOrders);

export default router;

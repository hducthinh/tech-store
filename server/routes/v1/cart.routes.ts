import express from "express";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
} from "../../controllers/cart.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";

const router = express.Router();

// Tất cả các API giỏ hàng đều yêu cầu người dùng phải đăng nhập
router.use(verifyToken);

router
  .route("/")
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.patch("/update-quantity", updateCartItemQuantity);
router.delete("/:productId", removeFromCart);

export default router;


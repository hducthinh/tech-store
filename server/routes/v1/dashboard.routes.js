import express from "express";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";
import catchAsync from "../../utils/catchAsync.js";
import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";
import User from "../../models/user.model.js";

const router = express.Router();

// Tất cả các route trong file này đều yêu cầu đăng nhập và là admin
router.use(verifyToken, verifyAdmin);

// @desc    Lấy thống kê tổng quan cho Admin
// @route   GET /api/v1/dashboard/stats
// @access  Private/Admin
router.get("/stats", catchAsync(async (req, res, next) => {
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments();
  
  // Tính tổng doanh thu (revenue)
  const revenueResult = await Order.aggregate([
    { $match: { status: { $ne: "CANCELLED" } } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  res.status(200).json({
    status: "success",
    data: {
      stats: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue
      }
    }
  });
}));

export default router;

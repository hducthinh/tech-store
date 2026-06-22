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

// @desc    Lấy dữ liệu biểu đồ doanh thu (7 ngày gần nhất)
// @route   GET /api/v1/dashboard/chart
// @access  Private/Admin
router.get("/chart", catchAsync(async (req, res, next) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0); // Bắt đầu từ 00:00:00 của 7 ngày trước

  const chartData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        status: { $ne: "CANCELLED" }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill những ngày không có đơn hàng (doanh thu = 0)
  const filledData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const existing = chartData.find(item => item._id === dateStr);
    
    filledData.push({
      date: dateStr,
      revenue: existing ? existing.revenue : 0,
      orders: existing ? existing.orders : 0
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      chart: filledData
    }
  });
}));

export default router;

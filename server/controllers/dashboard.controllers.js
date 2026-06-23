import catchAsync from "../utils/catchAsync.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// @desc    Lấy thống kê tổng quan cho Admin
// @route   GET /api/v1/dashboard/stats
// @access  Private/Admin
export const getStats = catchAsync(async (req, res, next) => {
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
});

// @desc    Lấy dữ liệu biểu đồ doanh thu (7 ngày gần nhất)
// @route   GET /api/v1/dashboard/chart
// @access  Private/Admin
export const getChart = catchAsync(async (req, res, next) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0); // Bắt đầu từ 00:00:00 của 7 ngày trước (Local Time)

  // Tính timezone offset của server (ví dụ: +07:00)
  const tzOffset = new Date().getTimezoneOffset();
  const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
  const tzMins = String(Math.abs(tzOffset) % 60).padStart(2, '0');
  const tzString = (tzOffset <= 0 ? '+' : '-') + tzHours + ':' + tzMins;

  const chartData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        status: { $ne: "CANCELLED" }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: tzString } },
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
    // Convert to local date string YYYY-MM-DD
    const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
    const dateStr = localDate.toISOString().split("T")[0];
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
});

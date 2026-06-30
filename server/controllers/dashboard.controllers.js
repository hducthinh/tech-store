import catchAsync from "../utils/catchAsync.js";
import dashboardService from "../services/dashboard.service.js";
import Order from "../models/order.model.js";

// @desc    Get dashboard summary stats
// @route   GET /api/v1/dashboard/summary
// @access  Private/Admin
export const getSummary = catchAsync(async (req, res, next) => {
  const summary = await dashboardService.getSummary();
  res.status(200).json({
    status: "success",
    data: summary
  });
});

// @desc    Get dashboard revenue chart data
// @route   GET /api/v1/dashboard/revenue
// @access  Private/Admin
export const getRevenue = catchAsync(async (req, res, next) => {
  const { timeframe } = req.query;
  const revenueChart = await dashboardService.getRevenue(timeframe);
  res.status(200).json({
    status: "success",
    data: revenueChart
  });
});

// @desc    Get dashboard category revenue data
// @route   GET /api/v1/dashboard/category-revenue
// @access  Private/Admin
export const getCategoryRevenue = catchAsync(async (req, res, next) => {
  const categoryRevenue = await dashboardService.getCategoryRevenue();
  res.status(200).json({
    status: "success",
    data: categoryRevenue
  });
});

// @desc    Get top products
// @route   GET /api/v1/dashboard/top-products
// @access  Private/Admin
export const getTopProducts = catchAsync(async (req, res, next) => {
  const topProducts = await Order.aggregate([
    { $match: { status: { $ne: "CANCELLED" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        sales: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 1,
        sales: 1,
        revenue: 1,
        name: "$product.name",
        category: "$product.categoryName",
        thumbnail: "$product.thumbnail",
        images: "$product.images",
        stock: "$product.stock"
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      topProducts
    }
  });
});

// @desc    Get dashboard overview (Batched)
// @route   GET /api/v1/dashboard/overview
// @access  Private/Admin
export const getOverview = catchAsync(async (req, res, next) => {
  const { timeframe } = req.query;
  
  const topProductsPromise = Order.aggregate([
    { $match: { status: { $ne: "CANCELLED" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        sales: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 1,
        sales: 1,
        revenue: 1,
        name: "$product.name",
        category: "$product.categoryName",
        thumbnail: "$product.thumbnail",
        images: "$product.images",
        stock: "$product.stock"
      }
    }
  ]);

  const [summary, revenueChart, categoryRevenue, topProducts] = await Promise.all([
    dashboardService.getSummary(),
    dashboardService.getRevenue(timeframe),
    dashboardService.getCategoryRevenue(),
    topProductsPromise
  ]);

  res.status(200).json({
    status: "success",
    data: {
      summary,
      revenueChart,
      categoryRevenue,
      topProducts: { topProducts }
    }
  });
});


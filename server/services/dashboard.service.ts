// @ts-nocheck
import dashboardRepository from "../repositories/dashboard.repository.js";
import { SummaryDTO, RevenueChartDTO, CategoryRevenueDTO } from "../dtos/dashboard.dto.js";

const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? "+100%" : "+0%";
  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  return (percentage > 0 ? "+" : "") + percentage.toFixed(1) + "%";
};

class DashboardService {
  async getSummary() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      totalOrders, totalProducts, activeProducts, inactiveProducts, totalUsers,
      currentMonthUsers, prevMonthUsers,
      currentMonthOrders, prevMonthOrders, salesGoal
    ] = await Promise.all([
      dashboardRepository.countOrders(),
      dashboardRepository.countProducts(),
      dashboardRepository.countProducts({ isActive: true }),
      dashboardRepository.countProducts({ isActive: false }),
      dashboardRepository.countUsers(),
      dashboardRepository.countUsers({ createdAt: { $gte: currentMonthStart } }),
      dashboardRepository.countUsers({ createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } }),
      dashboardRepository.countOrders({ createdAt: { $gte: currentMonthStart } }),
      dashboardRepository.countOrders({ createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } }),
      dashboardRepository.getSalesGoal()
    ]);

    const revenueResult = await dashboardRepository.aggregateOrders([
      { $match: { status: { $ne: "CANCELLED" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const currentMonthRev = await dashboardRepository.aggregateOrders([
      { $match: { status: { $ne: "CANCELLED" }, createdAt: { $gte: currentMonthStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    
    const prevMonthRev = await dashboardRepository.aggregateOrders([
      { $match: { status: { $ne: "CANCELLED" }, createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const currentRevenue = currentMonthRev[0]?.total || 0;
    const previousRevenue = prevMonthRev[0]?.total || 0;

    return new SummaryDTO({
      totalRevenue,
      totalOrders,
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalUsers,
      salesGoal, currentMonthUsers,
      revenueChange: calculateGrowth(currentRevenue, previousRevenue),
      ordersChange: calculateGrowth(currentMonthOrders, prevMonthOrders),
      usersChange: calculateGrowth(currentMonthUsers, prevMonthUsers),
      productGrowth: "+0%" // Products usually don`t have monthly growth
    });
  }

  async getRevenue(timeframe = "Th�ng") {
    const now = new Date();
    let startDate = new Date();
    let groupBy = {};

    switch (timeframe) {
      case "Ng�y":
        startDate.setDate(now.getDate() - 29);
        startDate.setHours(0,0,0,0);
        groupBy = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
        break;
      case "Tu?n":
        startDate.setDate(now.getDate() - 12 * 7);
        startDate.setHours(0,0,0,0);
        groupBy = { year: { $isoWeekYear: "$createdAt" }, week: { $isoWeek: "$createdAt" } };
        break;
      case "Th�ng":
        startDate.setMonth(now.getMonth() - 11);
        startDate.setDate(1);
        startDate.setHours(0,0,0,0);
        groupBy = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
        break;
      case "Nam":
        startDate.setFullYear(now.getFullYear() - 4);
        startDate.setMonth(0, 1);
        startDate.setHours(0,0,0,0);
        groupBy = { year: { $year: "$createdAt" } };
        break;
      default:
        startDate.setMonth(now.getMonth() - 11);
        groupBy = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
    }

    const results = await dashboardRepository.aggregateOrders([
      { $match: { status: { $ne: "CANCELLED" }, createdAt: { $gte: startDate } } },
      { $group: { _id: groupBy, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.day": 1 } }
    ]);

    return results.map(item => {
      let dateStr = "";
      if (timeframe === "Ng�y") dateStr = `${item._id.day}/${item._id.month}`;
      else if (timeframe === "Tu?n") dateStr = `W${item._id.week}`;
      else if (timeframe === "Th�ng") dateStr = `T${item._id.month}`;
      else if (timeframe === "Nam") dateStr = `${item._id.year}`;

      return new RevenueChartDTO({
        date: dateStr,
        revenue: item.revenue,
        orders: item.orders
      });
    });
  }

  async getCategoryRevenue() {
    const categoryRevenueResult = await dashboardRepository.aggregateOrders([
      { $match: { status: { $ne: "CANCELLED" } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$product.categoryName", "Khác"] },
          value: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { value: -1 } }
    ]);

    const allCategories = await dashboardRepository.getAllCategories();
    let mergedCategories = allCategories.map(cat => {
      const found = categoryRevenueResult.find(c => c._id === cat.name);
      return {
        _id: cat.name,
        value: found ? found.value : 0
      };
    });

    const uncategorized = categoryRevenueResult.find(c => c._id === "Khác");
    if (uncategorized) mergedCategories.push(uncategorized);

    mergedCategories.sort((a, b) => b.value - a.value);

    const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];
    const totalCatRevenue = mergedCategories.reduce((acc, curr) => acc + curr.value, 0);
    
    if (mergedCategories.length === 0) return [];

    let result = [];
    if (mergedCategories.length > 4) {
      const top3 = mergedCategories.slice(0, 3);
      const otherValue = mergedCategories.slice(3).reduce((acc, curr) => acc + curr.value, 0);
      
      const mapItem = (c, i) => new CategoryRevenueDTO({
        name: c._id,
        revenue: c.value,
        percentage: totalCatRevenue > 0 ? Number(((c.value / totalCatRevenue) * 100).toFixed(1)) : 0,
        color: PIE_COLORS[i]
      });

      result = [
        ...top3.map(mapItem),
        new CategoryRevenueDTO({
          name: "Khác",
          revenue: otherValue,
          percentage: totalCatRevenue > 0 ? Number(((otherValue / totalCatRevenue) * 100).toFixed(1)) : 0,
          color: PIE_COLORS[3]
        })
      ];
    } else {
      result = mergedCategories.map((c, i) => new CategoryRevenueDTO({
        name: c._id,
        revenue: c.value,
        percentage: totalCatRevenue > 0 ? Number(((c.value / totalCatRevenue) * 100).toFixed(1)) : 0,
        color: PIE_COLORS[i % PIE_COLORS.length]
      }));
    }

    return result;
  }
}

export default new DashboardService();





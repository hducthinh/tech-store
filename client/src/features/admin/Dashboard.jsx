import React, { useState, Suspense, useMemo } from "react";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { StatCard, Card, Badge, PIE_DATA, PIE_COLORS, fmt, img, CardSkeleton, ChartSkeleton, TableSkeleton } from "../../components/SharedUI";
import { useDashboardOverview } from "./hooks/useDashboard";

const RevenueChart = React.lazy(() => import("./components/RevenueChart"));
const CategoryPieChart = React.lazy(() => import("./components/CategoryPieChart"));

// Memoized StatCard wrapper to prevent re-renders when other things change
const MemoStatCard = React.memo(StatCard);

export default function AdminDashboard() {
  const [revenueTime, setRevenueTime] = useState("Tháng này");

  // Single batched API request
  const { data: overview, isLoading } = useDashboardOverview(revenueTime);
  
  const stats = overview?.summary;
  const chartDataRaw = overview?.revenueChart;
  const pieData = overview?.categoryRevenue || [];
  const topProductsData = overview?.topProducts?.topProducts || [];

  const chartData = useMemo(() => {
    return (chartDataRaw || []).map(c => ({
      month: c.date.substring(5), // MM-DD
      revenue: c.revenue / 1000000 // Convert to Tr
    }));
  }, [chartDataRaw]);

  const salesGoal = 100000000; // 100M VND
  const currentRevenue = stats?.revenue || 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tổng quan</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi hoạt động kinh doanh của cửa hàng</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={revenueTime} 
            onChange={(e) => setRevenueTime(e.target.value)}
            className="bg-white border border-gray-200 text-sm font-semibold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option>Hôm nay</option>
            <option>Tuần này</option>
            <option>Tháng này</option>
            <option>Năm nay</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <MemoStatCard label="Tổng doanh thu" value={fmt(stats?.revenue || 0)} change={stats?.revenueGrowth || "+0%"} icon={<DollarSign size={24}/>} color="blue" />
            <MemoStatCard label="Đơn hàng" value={stats?.orders || 0} change={stats?.orderGrowth || "+0%"} icon={<ShoppingCart size={24}/>} color="green" />
            <MemoStatCard label="Sản phẩm" value={stats?.products || 0} subtext={`${stats?.activeProducts || 0} đang bán - ${stats?.inactiveProducts || 0} tạm ẩn`} icon={<Package size={24}/>} color="amber" />
            <MemoStatCard label="Khách hàng" value={stats?.customers || 0} change={stats?.customerGrowth || "+0%"} suffix={`${stats?.currentMonthUsers || 0} mới tháng này`} icon={<Users size={24}/>} color="purple" />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        {isLoading ? (
          <div className="lg:col-span-2"><ChartSkeleton height="h-[350px]" /></div>
        ) : (
          <Card className="p-0 lg:col-span-2 flex flex-col overflow-hidden shadow-layered border-gray-100">
            <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Doanh thu</h3>
                <Badge color="green" className="mt-1 bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] uppercase tracking-wider py-0.5">
                  +15%
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-500 block">Tổng cộng</span>
                <span className="text-xl font-black text-blue-600">{fmt(currentRevenue)}</span>
              </div>
            </div>
            <div className="h-[280px] w-full mt-4">
              <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
                <RevenueChart data={chartData} />
              </Suspense>
            </div>
          </Card>
        )}

        {/* Pie Chart */}
        {isLoading ? (
          <div><ChartSkeleton height="h-[350px]" /></div>
        ) : (
          <Card className="p-6 flex flex-col shadow-layered border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Danh mục nổi bật</h3>
            <div className="h-[220px] w-full">
              <Suspense fallback={<ChartSkeleton height="h-[220px]" />}>
                <CategoryPieChart data={pieData} />
              </Suspense>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              {(pieData.length ? pieData : PIE_DATA).map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform" style={{backgroundColor: PIE_COLORS[i % PIE_COLORS.length]}}></div>
                    <span className="text-gray-600 font-semibold">{item.name}</span>
                  </div>
                  <span className="font-black text-gray-900">{pieData.length ? item.percentage : item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="w-full">
        <div>
          {isLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : (
            <Card className="flex flex-col shadow-layered border-gray-100 h-full overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Sản phẩm bán chạy</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Các sản phẩm mang lại doanh thu cao nhất</p>
                </div>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Sản phẩm</th>
                      <th className="px-6 py-4 text-right">Đã bán</th>
                      <th className="px-6 py-4 text-right">Doanh thu</th>
                      <th className="px-6 py-4 text-center">Đóng góp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topProductsData.length > 0 ? topProductsData.map((prod, idx) => {
                      const prodProgress = Math.min(((prod.revenue / (salesGoal || 100000000)) * 100).toFixed(1), 100);
                      const imgUrl = (prod.thumbnail || (prod.images && prod.images[0])) ? (prod.thumbnail || prod.images[0]) : img("1610945415295-d9bbf067e59c");
                      return (
                        <tr key={prod._id || idx} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                  <img src={imgUrl} alt={prod.name} className="w-full h-full object-cover" />
                                </div>
                                {idx < 3 && (
                                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-300' : 'bg-amber-600'}`}>
                                    #{idx+1}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-sm mb-0.5">{prod.name}</span>
                                <span className="text-xs text-gray-500 font-medium">{prod.category || "Danh mục"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-sm font-bold">{prod.sales}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-gray-900">{fmt(prod.revenue)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${prodProgress}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-8">{prodProgress}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Package size={40} className="mb-3 opacity-20" />
                            <p className="font-medium text-sm text-gray-500">Chưa có dữ liệu sản phẩm</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

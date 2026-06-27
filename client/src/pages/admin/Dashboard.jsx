import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { DollarSign, ShoppingCart, Users, Package, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { StatCard, Card, Badge, StatusBadge, PIE_DATA, PIE_COLORS, fmt, img } from "../../components/SharedUI";
import api from "../../services/api";

export default function AdminDashboard() {
  const [revenueTime, setRevenueTime] = useState("Tháng này");
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes, ordersRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/chart"),
          api.get("/orders/admin")
        ]);
        setStats(statsRes.data?.data?.stats);
        
        const mappedChart = chartRes.data?.data?.chart?.map(c => ({
          month: c.date.substring(5), // MM-DD
          revenue: c.revenue / 1000000 // Convert to Tr
        })) || [];
        setChartData(mappedChart);

        setRecentOrders(ordersRes.data?.data?.orders?.slice(0, 5) || []);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Đang tải dữ liệu...</div>;
  
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
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard label="Tổng doanh thu" value={fmt(stats?.totalRevenue || 0)} change="+12.5%" icon={<DollarSign size={24}/>} color="blue" />
        <StatCard label="Đơn hàng" value={stats?.totalOrders || 0} change="+5.2%" icon={<ShoppingCart size={24}/>} color="green" />
        <StatCard label="Sản phẩm" value={stats?.totalProducts || 0} icon={<Package size={24}/>} color="amber" />
        <StatCard label="Khách hàng" value={stats?.totalUsers || 0} change="+18.2%" icon={<Users size={24}/>} color="purple" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Biểu đồ doanh thu</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => [`${value} Tr`, 'Doanh thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-6">Doanh thu theo danh mục</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}
                  dataKey="value" stroke="none"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => [`${value}%`, 'Tỷ trọng']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {PIE_DATA.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: PIE_COLORS[i]}}></div>
                  <span className="text-gray-600 font-semibold">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Đơn hàng gần đây</h3>
          <button className="text-sm font-semibold text-blue-600 hover:underline">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Mã đơn</th>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Ngày đặt</th>
                <th className="px-6 py-4 font-semibold">Tổng tiền</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map(o => (
                <tr key={o._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">#{o._id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{o.shippingAddress?.fullName || o.userId?.fullName || "Khách"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">{fmt(o.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button className="p-1.5 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors"><Eye size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

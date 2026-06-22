import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        if (res.data.status === "success") {
          setStats(res.data.data.stats);
        }
      } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const statCards = [
    { title: "Tổng doanh thu", value: formatVND(stats.totalRevenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Tổng đơn hàng", value: stats.totalOrders, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Sản phẩm", value: stats.totalProducts, icon: Package, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Khách hàng", value: stats.totalUsers, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${card.bg}`}>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Khu vực hiển thị biểu đồ doanh thu (Đang cập nhật...)</p>
        </div>
      </div>
    </div>
  );
}

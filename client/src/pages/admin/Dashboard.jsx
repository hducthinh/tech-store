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
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/chart")
        ]);
        if (statsRes.data.status === "success") {
          setStats(statsRes.data.data.stats);
        }
        if (chartRes.data.status === "success") {
          setChartData(chartRes.data.data.chart);
        }
      } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Tính toán thông số cho biểu đồ SVG
  const svgWidth = 800;
  const svgHeight = 300;
  const paddingX = 80;
  const paddingY = 40;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;
  
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000000); // Tối thiểu 1 triệu để scale không quá to
  const stepX = chartData.length > 1 ? usableWidth / (chartData.length - 1) : usableWidth;

  const points = chartData.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = svgHeight - paddingY - (d.revenue / maxRevenue) * usableHeight;
    return `${x},${y}`;
  }).join(" ");

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

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold text-slate-800 w-full mb-6">Biểu đồ doanh thu 7 ngày qua</h3>
        {chartData.length > 0 ? (
          <div className="w-full overflow-x-auto pb-4">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[600px] drop-shadow-sm">
              {/* Lưới nền (Grid Y) */}
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                const y = svgHeight - paddingY - ratio * usableHeight;
                return (
                  <g key={ratio}>
                    <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <text x={paddingX - 10} y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end">
                      {ratio > 0 ? formatVND(maxRevenue * ratio).replace(" ₫", "").replace("₫", "đ") : "0đ"}
                    </text>
                  </g>
                );
              })}
              
              {/* Vẽ đường đồ thị */}
              <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Vẽ vùng gradient (Area) dưới đường line */}
              <polygon 
                points={`${paddingX},${svgHeight - paddingY} ${points} ${svgWidth - paddingX},${svgHeight - paddingY}`} 
                fill="url(#blue-gradient)" 
                opacity="0.2" 
              />
              
              {/* Định nghĩa Gradient */}
              <defs>
                <linearGradient id="blue-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Vẽ các điểm (circles) và nhãn trục X */}
              {chartData.map((d, i) => {
                const x = paddingX + i * stepX;
                const y = svgHeight - paddingY - (d.revenue / maxRevenue) * usableHeight;
                const isToday = i === chartData.length - 1;
                const dateLabel = d.date.split("-").slice(1).reverse().join("/"); // DD/MM
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" className="transition-all hover:r-6 cursor-pointer" />
                    <text x={x} y={svgHeight - paddingY + 20} fontSize="12" fill={isToday ? "#3b82f6" : "#64748b"} textAnchor="middle" fontWeight={isToday ? "bold" : "normal"}>
                      {isToday ? "Hôm nay" : dateLabel}
                    </text>
                    {/* Hiển thị số tiền nhỏ ở trên các điểm có doanh thu */}
                    {d.revenue > 0 && (
                      <text x={x} y={y - 12} fontSize="10" fill="#1e293b" textAnchor="middle" fontWeight="bold">
                        {formatVND(d.revenue).replace(" ₫", "").replace("₫", "")}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="py-20 text-center">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">Chưa có dữ liệu giao dịch</p>
          </div>
        )}
      </div>
    </div>
  );
}

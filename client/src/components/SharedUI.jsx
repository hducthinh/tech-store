import React from "react";
import { TrendingUp } from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────
export const PRODUCTS = [
  { id: 1, name: "iPhone 15 Pro Max 256GB", category: "Điện thoại", brand: "Apple", price: 28990000, stock: 45, status: "Còn hàng", img: "photo-1696446700704-46c3e3e55a51", rating: 4.8, reviews: 234 },
  { id: 2, name: "Samsung Galaxy S24 Ultra", category: "Điện thoại", brand: "Samsung", price: 31990000, stock: 32, status: "Còn hàng", img: "photo-1610945415295-d9bbf067e59c", rating: 4.7, reviews: 189 },
  { id: 3, name: "MacBook Pro 14\" M3 Pro", category: "Laptop", brand: "Apple", price: 52990000, stock: 18, status: "Còn hàng", img: "photo-1517336714731-489689fd1ca8", rating: 4.9, reviews: 97 },
  { id: 4, name: "Dell XPS 15 9530", category: "Laptop", brand: "Dell", price: 41990000, stock: 0, status: "Hết hàng", img: "photo-1593642632559-0c6d3fc62b89", rating: 4.6, reviews: 54 },
  { id: 5, name: "Sony WH-1000XM5", category: "Tai nghe", brand: "Sony", price: 7490000, stock: 67, status: "Còn hàng", img: "photo-1505740420928-5e560c06d30e", rating: 4.8, reviews: 412 },
  { id: 6, name: "iPad Pro 12.9\" M2", category: "Máy tính bảng", brand: "Apple", price: 27990000, stock: 24, status: "Còn hàng", img: "photo-1544244015-0df4b3ffc6b0", rating: 4.7, reviews: 156 },
];

export const CATEGORIES = [
  { id: 1, name: "Điện thoại", slug: "dien-thoai", products: 124, img: "📱" },
  { id: 2, name: "Laptop", slug: "laptop", products: 87, img: "💻" },
  { id: 3, name: "Tai nghe", slug: "tai-nghe", products: 63, img: "🎧" },
  { id: 4, name: "Máy tính bảng", slug: "may-tinh-bang", products: 45, img: "📟" },
  { id: 5, name: "Phụ kiện", slug: "phu-kien", products: 231, img: "🔌" },
  { id: 6, name: "Đồng hồ thông minh", slug: "dong-ho", products: 38, img: "⌚" },
];

export const BRANDS = [
  { id: 1, name: "Apple", products: 87, country: "Hoa Kỳ", status: "Hoạt động" },
  { id: 2, name: "Samsung", products: 64, country: "Hàn Quốc", status: "Hoạt động" },
  { id: 3, name: "Sony", products: 43, country: "Nhật Bản", status: "Hoạt động" },
  { id: 4, name: "Dell", products: 29, country: "Hoa Kỳ", status: "Hoạt động" },
  { id: 5, name: "Xiaomi", products: 52, country: "Trung Quốc", status: "Hoạt động" },
  { id: 6, name: "ASUS", products: 38, country: "Đài Loan", status: "Tạm dừng" },
];

export const ORDERS = [
  { id: "DH001234", customer: "Nguyễn Văn An", date: "27/06/2026", total: 28990000, status: "Đã giao", items: 1 },
  { id: "DH001233", customer: "Trần Thị Bình", date: "27/06/2026", total: 7490000, status: "Đang giao", items: 1 },
  { id: "DH001232", customer: "Lê Hoàng Cường", date: "26/06/2026", total: 52990000, status: "Đang xử lý", items: 2 },
  { id: "DH001231", customer: "Phạm Thị Dung", date: "26/06/2026", total: 31990000, status: "Đã huỷ", items: 1 },
  { id: "DH001230", customer: "Hoàng Văn Em", date: "25/06/2026", total: 41990000, status: "Đã giao", items: 3 },
  { id: "DH001229", customer: "Vũ Thị Phương", date: "25/06/2026", total: 27990000, status: "Đã giao", items: 1 },
];

export const USERS_DATA = [
  { id: 1, name: "Nguyễn Văn An", email: "an.nguyen@email.com", phone: "0901234567", joined: "01/01/2026", orders: 12, status: "Hoạt động" },
  { id: 2, name: "Trần Thị Bình", email: "binh.tran@email.com", phone: "0912345678", joined: "15/02/2026", orders: 5, status: "Hoạt động" },
  { id: 3, name: "Lê Hoàng Cường", email: "cuong.le@email.com", phone: "0923456789", joined: "20/03/2026", orders: 8, status: "Khoá" },
  { id: 4, name: "Phạm Thị Dung", email: "dung.pham@email.com", phone: "0934567890", joined: "05/04/2026", orders: 3, status: "Hoạt động" },
  { id: 5, name: "Hoàng Văn Em", email: "em.hoang@email.com", phone: "0945678901", joined: "12/05/2026", orders: 21, status: "Hoạt động" },
];

export const REVENUE_DATA = [
  { month: "T1", revenue: 240, orders: 45 }, { month: "T2", revenue: 310, orders: 58 },
  { month: "T3", revenue: 280, orders: 51 }, { month: "T4", revenue: 420, orders: 79 },
  { month: "T5", revenue: 390, orders: 72 }, { month: "T6", revenue: 510, orders: 94 },
];

export const PIE_DATA = [
  { name: "Điện thoại", value: 42 }, { name: "Laptop", value: 28 },
  { name: "Tai nghe", value: 18 }, { name: "Khác", value: 12 },
];

export const PIE_COLORS = ["#1B4FD8", "#10B981", "#F59E0B", "#8B5CF6"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n) + "₫";
export const img = (id, w = 600, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;

// ─── Shared UI ───────────────────────────────────────────────────────────────
export function Badge({ children, color = "blue", className = "" }) {
  const map = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[color] || map.blue} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    "Đã giao": "green", "Đang giao": "blue", "Đang xử lý": "yellow",
    "Đã huỷ": "red", "Còn hàng": "green", "Hết hàng": "red",
    "Hoạt động": "green", "Tạm dừng": "yellow", "Khoá": "red",
  };
  return <Badge color={map[status] || "gray"}>{status}</Badge>;
}

export function Btn({
  children, onClick, variant = "primary", size = "md", className = "", type = "button", disabled, ...props
}) {
  const v = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-gray-700 hover:bg-gray-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };
  const s = {
    sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${v[variant]} ${s[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  label, type = "text", placeholder, value, onChange, icon, className = "",
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-semibold text-gray-900">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
}

export function Card({ children, className = "", ...props }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, change, icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600", purple: "bg-purple-50 text-purple-600",
  };
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {change && (
          <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
            <TrendingUp size={12} /> {change} so với tháng trước
          </p>
        )}
      </div>
    </Card>
  );
}

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
export const img = (path, w = 600, h = 600) => {
  if (!path) return `https://placehold.co/${w}x${h}/e2e8f0/64748b?text=Product`;
  if (path.startsWith("http")) return path;
  if (path.includes("photo-")) return `https://images.unsplash.com/${path}?w=${w}&h=${h}&fit=crop&auto=format`;
  return `https://placehold.co/${w}x${h}/e2e8f0/64748b?text=Product`;
};

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
    "PENDING": "yellow", "PROCESSING": "blue", "SHIPPED": "blue",
    "DELIVERED": "green", "COMPLETED": "green", "CANCELLED": "red",
    "FAILED": "red", "RETURNED": "red"
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
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 ease-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${v[variant]} ${s[size]} ${className}`}
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
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-layered hover:shadow-float hover:-translate-y-1 transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:hover:transform-none ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = React.useState(0);
  
  React.useEffect(() => {
    let start = 0;
    const end = typeof value === "number" ? value : parseInt(value?.toString().replace(/\D/g, '')) || 0;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(end);
      return;
    }

    let startTimestamp = null;
    const duration = 1000;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  if (typeof value === "string" && value.includes('₫')) return fmt(displayValue);
  return displayValue;
}

export function StatCard({ label, value, change, icon, color = "blue", subtext, suffix = "vs last month" }) {
  // Mock change if not provided
  const displayChange = change || "+12.5%";
  const isPositive = !displayChange.startsWith("-");
  
  const colors = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "hover:border-blue-300",
      sparkline: "stroke-blue-400"
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "hover:border-emerald-300",
      sparkline: "stroke-emerald-400"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-500",
      border: "hover:border-amber-300",
      sparkline: "stroke-amber-400"
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "hover:border-purple-300",
      sparkline: "stroke-purple-400"
    }
  };

  const theme = colors[color] || colors.blue;

  // Mini sparkline SVG data
  const sparklinePaths = {
    blue: "M0,15 Q5,10 10,12 T20,8 T30,14 T40,5 T50,0",
    green: "M0,20 Q5,18 10,15 T20,10 T30,12 T40,2 T50,0",
    amber: "M0,10 Q5,15 10,12 T20,5 T30,8 T40,2 T50,5",
    purple: "M0,18 Q5,12 10,14 T20,8 T30,10 T40,5 T50,2"
  };

  return (
    <div className={`relative bg-white rounded-2xl border border-gray-100 p-6 shadow-layered hover:shadow-float hover:-translate-y-1 transition-all duration-200 ease-out group overflow-hidden ${theme.border} cursor-default motion-reduce:transition-none motion-reduce:hover:transform-none`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-semibold mb-1 group-hover:text-gray-700 transition-colors">{label}</p>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
            <AnimatedNumber value={value} />
          </h3>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.text} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-center justify-between relative z-10 mt-6 min-h-[24px]">
        {subtext ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{subtext}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <TrendingUp size={12} className={!isPositive ? "rotate-180" : ""} />
              {displayChange}
            </span>
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{suffix}</span>
          </div>
        )}
      </div>

      {/* Decorative Sparkline */}
      <svg className="absolute bottom-0 right-0 w-32 h-16 opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" viewBox="0 0 50 20" preserveAspectRatio="none">
        <path 
          d={sparklinePaths[color] || sparklinePaths.blue} 
          fill="none" 
          strokeWidth="1.5"
          className={theme.sparkline}
          vectorEffect="non-scaling-stroke"
        />
        {/* Gradient fill under sparkline */}
        <path 
          d={`${sparklinePaths[color] || sparklinePaths.blue} L50,20 L0,20 Z`} 
          fill="currentColor" 
          className={`${theme.text} opacity-[0.03]`}
        />
      </svg>
    </div>
  );
}

export function EmptyState({ icon, title, description, primaryAction, secondaryAction }) {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center shadow-layered border-gray-100 min-h-[400px]">
      <div className="relative mb-8 group">
        {/* Soft colorful blob behind icon */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 via-indigo-100 to-purple-100 rounded-full blur-xl scale-[2] opacity-50 group-hover:opacity-70 group-hover:scale-[2.25] transition-all duration-700 ease-out"></div>
        {/* Icon container */}
        <div className="relative w-20 h-20 bg-white/80 backdrop-blur-sm border border-white rounded-3xl shadow-layered flex items-center justify-center transform group-hover:-translate-y-1 group-hover:rotate-3 transition-all duration-500 ease-out z-10">
          <div className="text-blue-600">
            {icon}
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-black text-gray-900 mb-2.5">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-8 font-medium leading-relaxed">
        {description}
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        {secondaryAction && (
          <button 
            onClick={secondaryAction.onClick}
            className="px-6 py-2.5 rounded-2xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md"
          >
            {secondaryAction.label}
          </button>
        )}
        {primaryAction && (
          <button 
            onClick={primaryAction.onClick}
            className="px-6 py-2.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 flex items-center gap-2"
          >
            {primaryAction.icon && <span className="opacity-90">{primaryAction.icon}</span>}
            {primaryAction.label}
          </button>
        )}
      </div>
    </Card>
  );
}

// ─── Skeleton Primitives ──────────────────────────────────────────────────────
const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export function Skeleton({ className = "" }) {
  return <div className={`bg-gray-100 rounded-lg ${shimmerClass} ${className}`} />;
}

export function AvatarSkeleton({ size = "w-10 h-10" }) {
  return <Skeleton className={`${size} !rounded-full shrink-0`} />;
}

export function ButtonSkeleton({ width = "w-28" }) {
  return <Skeleton className={`${width} h-9 !rounded-2xl`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-layered">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-36" />
        </div>
        <Skeleton className="w-14 h-14 !rounded-2xl shrink-0" />
      </div>
      <div className="flex items-center gap-2 mt-6">
        <Skeleton className="h-5 w-16 !rounded-md" />
        <Skeleton className="h-3 w-20" />
      </div>
      {/* Fake sparkline area */}
      <Skeleton className="absolute bottom-0 right-0 w-32 h-16 !rounded-none opacity-30" />
    </div>
  );
}

export function ChartSkeleton({ height = "h-[300px]" }) {
  return (
    <Card className="shadow-layered border-gray-100">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 !rounded-lg" />
          <Skeleton className="h-8 w-16 !rounded-lg" />
          <Skeleton className="h-8 w-16 !rounded-lg" />
        </div>
      </div>
      <div className={`p-6 ${height} flex items-end gap-3`}>
        {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 68].map((h, i) => (
          <Skeleton key={i} className="flex-1 !rounded-t-md !rounded-b-none" style={{ height: `${h}%` }} />
        ))}
      </div>
    </Card>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <Card className="p-0 overflow-hidden shadow-layered border-gray-100">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <Skeleton className="h-9 w-72 !rounded-lg" />
      </div>
      {/* Header */}
      <div className="flex gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={`flex items-center gap-4 px-6 py-4 ${r < rows - 1 ? 'border-b border-gray-50' : ''}`}>
          {r % 2 === 0 && <AvatarSkeleton size="w-10 h-10" />}
          {Array.from({ length: r % 2 === 0 ? cols - 1 : cols }).map((_, c) => (
            <Skeleton key={c} className={`h-4 flex-1 ${c === 0 && r % 2 !== 0 ? '!w-32' : ''}`} />
          ))}
        </div>
      ))}
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <ButtonSkeleton width="w-32" />
          <ButtonSkeleton width="w-24" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map(i => <CardSkeleton key={i} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2"><ChartSkeleton height="h-[350px]" /></div>
        <div><ChartSkeleton height="h-[350px]" /></div>
        <div>
          <Card className="shadow-layered border-gray-100 h-full">
            <div className="p-5 border-b border-gray-100 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <div className="p-8 flex items-center justify-center">
              <Skeleton className="w-40 h-40 !rounded-full" />
            </div>
            <div className="px-5 pb-5 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        </div>
      </div>

      {/* Table */}
      <TableSkeleton rows={4} cols={6} />
    </div>
  );
}

export function PageSkeleton({ title = true }) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {title && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-3">
            <ButtonSkeleton />
            <ButtonSkeleton width="w-36" />
          </div>
        </div>
      )}
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}

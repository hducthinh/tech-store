import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, ShoppingCart, Box, Tags, Shield, Users, 
  Settings, LogOut, Search, Bell 
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { icon: <LayoutDashboard size={20} />, label: "Tổng quan", to: "/admin" },
    { icon: <ShoppingCart size={20} />, label: "Đơn hàng", to: "/admin/orders" },
    { icon: <Box size={20} />, label: "Sản phẩm", to: "/admin/products" },
    { icon: <Tags size={20} />, label: "Danh mục", to: "/admin/categories" },
    { icon: <Shield size={20} />, label: "Thương hiệu", to: "/admin/brands" },
    { icon: <Users size={20} />, label: "Người dùng", to: "/admin/users" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
            <span className="text-white text-xs font-black">TC</span>
          </div>
          <span className="text-xl font-black text-blue-600">Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <button
                key={l.label}
                onClick={() => navigate(l.to)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  active ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {l.icon}
                {l.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 cursor-pointer">
            <Settings size={20} /> Cài đặt
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={20} /> Thoát
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Tìm kiếm quản trị..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">Quản trị viên</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                A
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

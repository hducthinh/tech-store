import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Box, Users, LogOut, Terminal, FolderTree, Tag } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { name: "Tổng quan", path: "/admin", icon: LayoutDashboard },
    { name: "Đơn hàng", path: "/admin/orders", icon: ShoppingCart },
    { name: "Sản phẩm", path: "/admin/products", icon: Box },
    { name: "Danh mục", path: "/admin/categories", icon: FolderTree },
    { name: "Thương hiệu", path: "/admin/brands", icon: Tag },
    { name: "Khách hàng", path: "/admin/users", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#00236f] text-white flex flex-col transition-all">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="p-2 bg-white/10 rounded-lg">
            <Terminal className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-white">TechStore</h1>
            <p className="text-[10px] font-mono text-blue-200">ADMIN CONTROL PANEL</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-400 text-slate-900 shadow-md"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
              <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Tài khoản</span>
              <span className="text-sm font-bold truncate max-w-[150px]">{user?.fullName}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-red-500 hover:text-white text-red-300 rounded-lg text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">Bảng điều khiển Quản trị</h2>
          <div className="text-sm text-slate-500">
            Hệ thống đang hoạt động bình thường
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

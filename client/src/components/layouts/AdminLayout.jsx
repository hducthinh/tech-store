import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Users, Megaphone,
  LogOut, ChevronLeft, ChevronRight,
  Box, Tags, Shield, Monitor, Menu, Plus
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuGroups = [
    {
      label: "Overview",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
      ]
    },
    {
      label: "Catalog",
      items: [
        { icon: Box, label: "Products", to: "/admin/products" },
        { icon: Tags, label: "Categories", to: "/admin/categories" },
        { icon: Shield, label: "Brands", to: "/admin/brands" },
      ]
    },
    {
      label: "Sales",
      items: [
        { icon: ShoppingCart, label: "Orders", to: "/admin/orders" },
        { icon: Users, label: "Customers", to: "/admin/users" },
      ]
    },
    {
      label: "Marketing",
      items: [
        { icon: Megaphone, label: "Marketing", to: "/admin/marketing" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ease-in-out ${isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-40 transition-all duration-300 ease-in-out motion-reduce:transition-none 
        ${isCollapsed ? 'w-20' : 'w-[260px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Header Logo */}
        <div className="h-[72px] flex items-center px-6 border-b border-[#E5E7EB] cursor-pointer group shrink-0" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Monitor size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out motion-reduce:transition-none ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100 ml-3'}`}>
            <span className="text-xl font-black tracking-tighter text-gray-900 group-hover:text-blue-700 transition-colors whitespace-nowrap">
              Tech<span className="text-blue-600">Admin</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <div className={`px-6 mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase transition-opacity duration-200 ease-out motion-reduce:transition-none ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                {group.label}
              </div>
              <div className="space-y-1 px-3">
                {group.items.map((item) => {
                  // Precise active check
                  const active = pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to));
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => { navigate(item.to); setIsMobileOpen(false); }}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl font-medium transition-all duration-200 group ${active ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                      {active && (
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-md transition-all`}></div>
                      )}
                      <Icon size={18} className={`shrink-0 ${isCollapsed ? '' : 'mr-3'} ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'} transition-colors`} />
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out motion-reduce:transition-none ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                        <span className="whitespace-nowrap">{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 shrink-0">

          <div className="space-y-1">

            <button
              onClick={() => navigate("/")}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-xl font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors`}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut size={18} className="shrink-0" />
              <div className={`overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none ${isCollapsed ? 'max-w-0 ml-0 opacity-0' : 'max-w-[200px] ml-3 opacity-100'}`}>
                <span className="whitespace-nowrap">Logout</span>
              </div>
            </button>
          </div>

          <div className={`mt-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors cursor-pointer">
              <ChevronLeft size={16} className={`transition-transform duration-200 ease-out motion-reduce:transition-none ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out motion-reduce:transition-none ${isCollapsed ? 'lg:ml-20' : 'lg:ml-[260px]'}`}>
        <header className="h-16 lg:h-[72px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 font-sans shrink-0">
          {/* Left section */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Mobile hamburger */}
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 -ml-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center text-sm text-gray-500 font-medium">
              <span className="hover:text-gray-900 cursor-pointer transition-colors">Dashboard</span>
              <ChevronRight size={16} className="mx-2 text-gray-400" />
              <span className="text-gray-900 font-semibold">Overview</span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">

            <div className="flex items-center gap-3 pl-2 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Admin</p>
                <p className="text-xs text-gray-500 font-medium">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[2px] shadow-sm">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-white overflow-hidden">
                  <span className="text-blue-600 font-bold text-sm">A</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => navigate('/admin/products')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-[0_8px_30px_rgba(37,99,235,0.4)] flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all z-30 lg:hidden"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

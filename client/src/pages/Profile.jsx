import React from "react";
import { User, FileText, LogOut, ShoppingCart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../hooks/useCart";

import ProfileInfo from "../components/profile/ProfileInfo";
import ProfileOrders from "../components/profile/ProfileOrders";
import ProfileCart from "../components/profile/ProfileCart";

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cartState = useCart(user?.email || "");

  useDocumentMeta("Hồ sơ cá nhân", "Quản lý thông tin tài khoản và đơn hàng của bạn tại TechStore.");

  const [activeTab, setActiveTab] = React.useState(location.state?.openOrderId ? "orders" : "info");
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  React.useEffect(() => {
    if (location.state?.openOrderId) {
      setActiveTab("orders");
    }
  }, [location.state?.openOrderId]);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/");
  };

  return (
    <>
      <div className="flex-1 w-full max-w-[1280px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-3 px-4 py-3 font-semibold text-sm transition-colors text-left rounded-r-lg border-l-4 ${activeTab === "info" ? "bg-slate-100 border-[#0058be] text-[#0058be]" : "text-slate-600 hover:bg-slate-50 border-transparent"}`}
            >
              <User className="w-5 h-5" />
              Thông tin tài khoản
            </button>
            <button 
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 px-4 py-3 font-semibold text-sm transition-colors text-left rounded-r-lg border-l-4 ${activeTab === "orders" ? "bg-slate-100 border-[#0058be] text-[#0058be]" : "text-slate-600 hover:bg-slate-50 border-transparent"}`}
            >
              <FileText className="w-5 h-5" />
              Lịch sử đơn hàng
            </button>
            <button 
              onClick={() => setActiveTab("cart")}
              className={`flex items-center gap-3 px-4 py-3 font-semibold text-sm transition-colors text-left rounded-r-lg border-l-4 ${activeTab === "cart" ? "bg-slate-100 border-[#0058be] text-[#0058be]" : "text-slate-600 hover:bg-slate-50 border-transparent"}`}
            >
              <ShoppingCart className="w-5 h-5" />
              Giỏ hàng của tôi
            </button>
            <div className="h-px bg-slate-200 my-2 mx-4"></div>
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-medium text-sm transition-colors text-left rounded-r-lg border-l-4 border-transparent"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "info" && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hồ sơ cá nhân</h1>
              <p className="text-slate-500 text-sm mt-1">Quản lý thông tin tài khoản và theo dõi lịch sử mua sắm của bạn.</p>
            </div>
          )}

          {activeTab === "info" && <ProfileInfo user={user} updateProfile={updateProfile} />}
          {activeTab === "orders" && <ProfileOrders user={user} setActiveTab={setActiveTab} />}
          {activeTab === "cart" && <ProfileCart {...cartState} />}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận đăng xuất</h3>
              <p className="text-sm text-slate-500">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?</p>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleLogoutConfirm}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

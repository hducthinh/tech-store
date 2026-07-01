import React, { useState, useEffect } from "react";
import { User, FileText, LogOut, ShoppingCart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Btn } from "../../components/SharedUI";
import ProfileOrders from "./components/ProfileOrders";
import ProfileCart from "./components/ProfileCart";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useAlert } from "../../contexts/AlertContext";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || (location.state?.openOrderId ? "orders" : "info"));
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const { showToast } = useAlert();
  const { cart, removeFromCart, loading: isCartLoading } = useCart();
  const cartItems = cart?.items || [];
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    const res = await updateProfile(profileData);
    if (res.success) {
      showToast("Cập nhật thông tin thành công!", "success");
    } else {
      showToast(res.error || "Có lỗi xảy ra", "error");
    }
    setIsUpdating(false);
  };

  const [selectedItemIds, setSelectedItemIds] = useState([]);

  useEffect(() => {
    if (cart?.items) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedItemIds(cart.items.map(i => i.productId?._id || i.product?.id).filter(Boolean));
    }
  }, [cart?.items]);

  const toggleItemSelection = (id) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAllSelection = (checked) => {
    if (checked && cart?.items) {
      setSelectedItemIds(cart.items.map(i => i.productId?._id || i.product?.id).filter(Boolean));
    } else {
      setSelectedItemIds([]);
    }
  };

  const getSelectedTotal = () => {
    return cart?.items?.filter(item => selectedItemIds.includes(item.productId?._id || item.product?.id))
      .reduce((a, b) => a + (b.productId?.price || b.price || 0) * b.quantity, 0) || 0;
  };

  useDocumentMeta("Hồ sơ cá nhân - DucThinh TechShop", "Quản lý thông tin tài khoản");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (location.state?.activeTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(location.state.activeTab);
    } else if (location.state?.openOrderId) {
       
      setActiveTab("orders");
    }
  }, [location.state]);

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-72 shrink-0">
            <Card className="p-4 flex flex-col gap-1 sticky top-24">
              <div className="flex items-center gap-4 p-4 border-b border-gray-100 mb-2">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              {[
                { id: "info", icon: <User size={18} />, label: "Thông tin cá nhân" },
                { id: "orders", icon: <FileText size={18} />, label: "Lịch sử đơn hàng" },
                { id: "cart", icon: <ShoppingCart size={18} />, label: "Giỏ hàng" },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors text-left ${activeTab === t.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
              
              <div className="h-px bg-gray-100 my-2 mx-2"></div>
              
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "info" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-[#0058be] pl-3">Thông tin cá nhân</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800" 
                        value={profileData.fullName} 
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" value={user?.email || ""} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                      <input 
                        type="tel" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800" 
                        value={profileData.phone} 
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ mặc định</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-gray-800" 
                        value={profileData.address} 
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Btn 
                      variant="primary" 
                      onClick={handleUpdateProfile}
                      disabled={isUpdating || (profileData.fullName === user?.fullName && profileData.phone === user?.phone && profileData.address === user?.address)}
                    >
                      {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                    </Btn>
                  </div>
              </div>
            )}

            {activeTab === "orders" && (
              <ProfileOrders user={user} setActiveTab={setActiveTab} />
            )}

            {activeTab === "cart" && (
              <ProfileCart 
                cart={cartItems.map(item => ({
                  ...item,
                  product: {
                    id: item.productId?._id,
                    name: item.productId?.name,
                    price: item.productId?.price,
                    image: item.productId?.images?.[0] || item.productId?.thumbnail
                  }
                }))}
                removeFromCart={removeFromCart}
                selectedItemIds={selectedItemIds}
                toggleItemSelection={toggleItemSelection}
                toggleAllSelection={toggleAllSelection}
                getSelectedTotal={getSelectedTotal}
                isLoading={isCartLoading}
              />
            )}
          </div>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <LogOut size={24} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Đăng xuất</h3>
            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
            <div className="flex gap-3">
              <Btn variant="outline" className="flex-1" onClick={() => setShowLogoutModal(false)}>Hủy</Btn>
              <Btn variant="primary" className="flex-1 bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 text-white" onClick={() => {
                logout();
                navigate("/");
              }}>Đăng xuất</Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

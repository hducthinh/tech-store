import React from "react";
import { User, FileText, Settings, LogOut, Camera, Edit2, ShoppingCart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    selectedItemIds,
    toggleItemSelection,
    toggleAllSelection,
    getSelectedTotal
  } = useCart(user?.email || "");

  useDocumentMeta("Hồ sơ cá nhân", "Quản lý thông tin tài khoản và đơn hàng của bạn tại TechStore.");

  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || ""
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("info");
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  // Sync state when user loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    await updateProfile(formData);
    setIsLoading(false);
    setIsEditing(false);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/");
  };

  const [orders, setOrders] = React.useState([]);
  const [selectedOrder, setSelectedOrder] = React.useState(null);

  React.useEffect(() => {
    if (user) {
      import("../services/api").then(({ default: api }) => {
        api.get("/orders")
          .then(res => {
            if (res.data.status === "success") {
              const mapped = res.data.data.orders.map(o => {
                let statusColor = "bg-slate-100 text-slate-700";
                let dot = "bg-slate-500";
                let statusText = o.status;
                
                if (o.status === "DELIVERED") {
                  statusColor = "bg-green-100 text-green-700";
                  dot = "bg-green-500";
                  statusText = "Đã giao hàng";
                } else if (o.status === "PROCESSING" || o.status === "PENDING") {
                  statusColor = "bg-amber-100 text-amber-700";
                  dot = "bg-amber-500";
                  statusText = "Đang xử lý";
                } else if (o.status === "CANCELLED") {
                  statusColor = "bg-red-100 text-red-700";
                  dot = "bg-red-500";
                  statusText = "Đã hủy";
                } else if (o.status === "SHIPPED") {
                  statusColor = "bg-blue-100 text-blue-700";
                  dot = "bg-blue-500";
                  statusText = "Đang giao hàng";
                }

                return {
                  id: "#" + o._id.substring(o._id.length - 6).toUpperCase(), 
                  rawId: o._id,
                  date: new Date(o.createdAt).toLocaleDateString("vi-VN") + " " + new Date(o.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                  total: o.totalAmount.toLocaleString("vi-VN") + " ₫",
                  status: statusText,
                  statusColor,
                  dot,
                  items: o.items || [],
                  shippingAddress: o.shippingAddress,
                  paymentMethod: o.paymentMethod || "COD",
                  totalAmount: o.totalAmount
                };
              });
              setOrders(mapped);
              
              if (location.state?.openOrderId) {
                const orderToOpen = mapped.find(o => o.rawId === location.state.openOrderId);
                if (orderToOpen) {
                  setSelectedOrder(orderToOpen);
                  setActiveTab("orders");
                  window.history.replaceState({}, document.title);
                }
              }
            }
          })
          .catch(console.error);
      });
    }
  }, [user]);

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

          {activeTab === "info" && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 bg-slate-200 rounded-full overflow-hidden border-4 border-white shadow-sm">
                      <div className="w-full h-full bg-[#00236f] text-white flex items-center justify-center text-3xl font-bold">
                        {user?.email?.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#0058be] rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm hover:bg-[#00236f] transition">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{user?.fullName || "Nguyễn Minh Quân"}</h2>
                    <p className="text-sm text-slate-500">Thành viên từ tháng 01, 2023</p>
                  </div>
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors shadow-sm"
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isLoading}
                      className="px-4 py-2 bg-[#0058be] text-white text-sm font-semibold rounded-lg hover:bg-[#00236f] transition-colors shadow-sm disabled:opacity-70"
                    >
                      {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0058be] text-white text-sm font-semibold rounded-lg hover:bg-[#00236f] transition-colors shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Họ và tên</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full text-sm font-semibold text-slate-800 pb-1 border-b border-[#0058be] focus:outline-none bg-slate-50 px-2 pt-1 rounded-t"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 pb-2 border-b border-slate-100">{user?.fullName || "Nguyễn Minh Quân"}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-semibold text-slate-800 pb-2 border-b border-slate-100">{user?.email || "quan.nguyen@techstore.io"} <span className="text-[10px] ml-2 text-slate-400 font-normal">(Không thể sửa)</span></p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Số điện thoại</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full text-sm font-semibold text-slate-800 pb-1 border-b border-[#0058be] focus:outline-none bg-slate-50 px-2 pt-1 rounded-t"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 pb-2 border-b border-slate-100">{user?.phone || "+84 987 654 321"}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Địa chỉ giao hàng</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full text-sm font-semibold text-slate-800 pb-1 border-b border-[#0058be] focus:outline-none bg-slate-50 px-2 pt-1 rounded-t"
                      placeholder="Nhập địa chỉ giao hàng..."
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 pb-2 border-b border-slate-100">
                      {user?.address || "Chưa cập nhật địa chỉ giao hàng"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-[#0058be] pl-3">Lịch sử đơn hàng</h2>
              {orders.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Bạn chưa có đơn hàng nào.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="pb-3 font-semibold px-4">Mã ĐH</th>
                        <th className="pb-3 font-semibold px-4">Ngày đặt</th>
                        <th className="pb-3 font-semibold px-4 text-right">Tổng tiền</th>
                        <th className="pb-3 font-semibold px-4">Trạng thái</th>
                        <th className="pb-3 font-semibold px-4 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-mono font-medium text-slate-700">#{o.id.substring(o.id.length - 6).toUpperCase()}</td>
                          <td className="py-4 px-4 text-slate-600">{o.date}</td>
                          <td className="py-4 px-4 text-right font-bold text-[#ba1a1a]">{o.totalAmount?.toLocaleString("vi-VN")} ₫</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${o.statusColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${o.dot}`}></span>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button 
                              onClick={() => setSelectedOrder(o)}
                              className="text-xs font-bold text-[#0058be] hover:text-[#00236f] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "cart" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-[#0058be] pl-3 flex justify-between items-center">
                <span>Giỏ hàng của bạn</span>
                {cart.length > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-normal text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                    <input 
                      type="checkbox"
                      checked={cart.length > 0 && selectedItemIds.length === cart.length}
                      onChange={(e) => toggleAllSelection(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0058be] focus:ring-[#0058be]"
                    />
                    Chọn tất cả ({cart.length})
                  </label>
                )}
              </h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="font-semibold text-slate-700 text-lg">Giỏ hàng rỗng</p>
                  <p className="text-sm text-slate-400 mt-2 mb-6">Bạn chưa thêm bất cứ linh kiện chuyên nghiệp nào vào giỏ.</p>
                  <button onClick={() => navigate("/")} className="px-6 py-2.5 bg-[#0058be] text-white font-bold rounded-xl hover:bg-[#00236f] transition-colors">
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-slate-200 text-sm font-semibold text-slate-500 px-4">
                    <div className="col-span-1 text-center">Chọn</div>
                    <div className="col-span-5">Sản phẩm</div>
                    <div className="col-span-2 text-center">Đơn giá</div>
                    <div className="col-span-2 text-center">Số lượng</div>
                    <div className="col-span-2 text-right">Thành tiền</div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-150 transition-colors hover:border-[#0058be]/30">
                        <div className="col-span-1 flex justify-center w-full md:w-auto self-start md:self-center">
                          <input 
                            type="checkbox"
                            checked={selectedItemIds.includes(item.product.id)}
                            onChange={() => toggleItemSelection(item.product.id)}
                            className="w-5 h-5 rounded border-slate-300 text-[#0058be] focus:ring-[#0058be] cursor-pointer"
                          />
                        </div>

                        <div className="col-span-5 flex items-center gap-4 w-full cursor-pointer" onClick={() => window.open(`/products/${item.product.slug || item.product.id}`, '_blank')}>
                          <div className="w-20 h-20 bg-white rounded-lg p-1.5 border border-slate-200 shrink-0">
                            <img src={item.product.image || item.product.thumbnail || "https://via.placeholder.com/300"} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div>
                            <h5 className="font-bold text-sm text-slate-800 line-clamp-2 hover:text-[#0058be] transition-colors">{item.product.name}</h5>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeFromCart(item.product.id); }}
                              className="text-xs text-red-500 hover:text-red-700 font-medium mt-2 flex items-center gap-1"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>

                        <div className="col-span-2 text-center hidden md:block">
                          <span className="font-semibold text-slate-700 text-sm">{(item.product.price).toLocaleString("vi-VN")} ₫</span>
                        </div>

                        <div className="col-span-2 flex justify-center w-full md:w-auto">
                          <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-lg transition-colors font-bold"
                            >-</button>
                            <span className="w-10 text-center font-bold text-sm text-slate-800">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-lg transition-colors font-bold"
                            >+</button>
                          </div>
                        </div>

                        <div className="col-span-2 text-right w-full md:w-auto flex justify-between md:block">
                          <span className="md:hidden text-sm font-semibold text-slate-500">Thành tiền:</span>
                          <span className="font-black text-[#ba1a1a]">{(item.product.price * item.quantity).toLocaleString("vi-VN")} ₫</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 mt-6 pt-6">
                    <div className="w-full bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-5">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-600 font-medium text-base">Tổng thanh toán ({selectedItemIds.length} sản phẩm):</span>
                        <span className="text-2xl font-black text-[#ba1a1a] whitespace-nowrap">{(getSelectedTotal()).toLocaleString("vi-VN")} ₫</span>
                      </div>
                      <button 
                        disabled={selectedItemIds.length === 0}
                        onClick={() => {
                          navigate("/checkout", { state: { selectedItemIds } });
                        }}
                        className="w-full md:w-auto px-10 py-3.5 bg-[#0058be] hover:bg-[#00236f] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
                      >
                        Tiến hành Thanh toán
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Chi tiết đơn hàng {selectedOrder.id}</h3>
                <p className="text-sm text-slate-500 mt-1">Ngày đặt: {selectedOrder.date}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${selectedOrder.statusColor}`}>
                <span className={`w-2 h-2 rounded-full ${selectedOrder.dot}`}></span>
                {selectedOrder.status}
              </span>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              {/* Product List */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Danh sách sản phẩm</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <div className="w-16 h-16 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100 p-1">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h5>
                        <p className="text-xs text-slate-500 mt-1">Số lượng: <span className="font-bold text-slate-700">{item.quantity}</span></p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[#0058be] text-sm">{(item.price * item.quantity).toLocaleString("vi-VN")} ₫</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Thông tin giao hàng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Người nhận:</p>
                    <p className="font-semibold text-slate-800">{selectedOrder.shippingAddress?.fullName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Số điện thoại:</p>
                    <p className="font-semibold text-slate-800">{selectedOrder.shippingAddress?.phone || "-"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 mb-1">Địa chỉ:</p>
                    <p className="font-semibold text-slate-800">{selectedOrder.shippingAddress?.address || "-"}</p>
                  </div>
                  <div className="md:col-span-2 mt-2 pt-4 border-t border-slate-200 flex justify-between items-center">
                    <p className="text-slate-500">Phương thức thanh toán:</p>
                    <p className="font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-white flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Tổng cộng</p>
                <p className="text-2xl font-black text-[#ba1a1a]">{selectedOrder.totalAmount?.toLocaleString("vi-VN")} ₫</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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

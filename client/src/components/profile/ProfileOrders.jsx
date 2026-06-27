import React, { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";

export default function ProfileOrders({ user, setActiveTab }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [orders, setOrders] = React.useState([]);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [cancelNote, setCancelNote] = useState("");

  React.useEffect(() => {
    if (user) {
      import("../../services/api").then(({ default: api }) => {
        api.get("/orders")
          .then(res => {
            if (res.data.status === "success") {
              const mapped = res.data.data.orders.map(o => {
                let statusColor = "bg-slate-100 text-slate-700";
                let dot = "bg-slate-500";
                let statusText = o.status;
                
                let rawStatus = o.status;
                if (o.status === "PENDING_PAYMENT") {
                  statusColor = "bg-orange-100 text-orange-700";
                  dot = "bg-orange-500";
                  statusText = "Chờ thanh toán";
                } else if (o.status === "PENDING") {
                  statusColor = "bg-amber-100 text-amber-700";
                  dot = "bg-amber-500";
                  statusText = "Chờ xác nhận";
                } else if (o.status === "CONFIRMED") {
                  statusColor = "bg-cyan-100 text-cyan-700";
                  dot = "bg-cyan-500";
                  statusText = "Đã xác nhận";
                } else if (o.status === "PROCESSING") {
                  statusColor = "bg-blue-100 text-blue-700";
                  dot = "bg-blue-500";
                  statusText = "Đang chuẩn bị hàng";
                } else if (o.status === "SHIPPED") {
                  statusColor = "bg-purple-100 text-purple-700";
                  dot = "bg-purple-500";
                  statusText = "Đang giao hàng";
                } else if (o.status === "DELIVERED") {
                  statusColor = "bg-emerald-100 text-emerald-700";
                  dot = "bg-emerald-500";
                  statusText = "Đã giao hàng";
                } else if (o.status === "COMPLETED") {
                  statusColor = "bg-green-100 text-green-700";
                  dot = "bg-green-500";
                  statusText = "Đã hoàn thành";
                } else if (o.status === "CANCELLED") {
                  statusColor = "bg-red-100 text-red-700";
                  dot = "bg-red-500";
                  statusText = "Đã hủy";
                }

                return {
                  id: "#" + o._id.substring(o._id.length - 6).toUpperCase(), 
                  rawId: o._id,
                  rawStatus,
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
                  if(setActiveTab) setActiveTab("orders");
                  navigate(location.pathname, { replace: true, state: {} });
                }
              }
            }
          })
          .catch(console.error);
      });
    }
  }, [user, location.state?.openOrderId, setActiveTab]);

  const executeCancelOrder = async () => {
    if (!selectedOrder) return;
    const orderId = selectedOrder.rawId;
    setIsCancelling(true);
    try {
      const api = (await import("../../services/api")).default;
      const res = await api.post(`/orders/${orderId}/cancel`);
      if (res.data.status === "success") {
        setOrders(prev => prev.map(o => {
          if (o.rawId === orderId) {
            return {
              ...o,
              rawStatus: "CANCELLED",
              status: "Đã hủy",
              statusColor: "bg-red-100 text-red-700",
              dot: "bg-red-500"
            };
          }
          return o;
        }));
        setSelectedOrder(null);
        setShowCancelModal(false);
        setCancelNote("");
      }
    } catch (error) {
      console.error(error);
      showAlert(error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng", "error");
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  return (
    <>
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
              <div className="flex items-center gap-3">
                {["PENDING_PAYMENT", "PENDING", "CONFIRMED"].includes(selectedOrder.rawStatus) && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={isCancelling}
                    className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Hủy đơn hàng
                  </button>
                )}
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Hủy đơn hàng này?</h3>
              <p className="text-sm text-slate-500">Bạn có chắc chắn muốn hủy đơn hàng <span className="font-bold">{selectedOrder.id}</span> không? Hành động này không thể hoàn tác.</p>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
              <button 
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Không
              </button>
              <button 
                onClick={executeCancelOrder}
                disabled={isCancelling}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang hủy...
                  </>
                ) : (
                  "Đồng ý hủy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

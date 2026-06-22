import React, { useState } from "react";
import { ShoppingCart, Loader2, Search, X, Check, Eye } from "lucide-react";
import { useAdminOrders } from "../../hooks/useAdminOrders";

const STATUS_COLORS = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700"
};

const STATUS_LABELS = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang đóng gói",
  SHIPPED: "Đang giao hàng",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy"
};

export default function AdminOrders() {
  const { orders, loading, updateOrderStatus } = useAdminOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
    });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (window.confirm(`Xác nhận đổi trạng thái thành "${STATUS_LABELS[newStatus]}"?`)) {
      const res = await updateOrderStatus(orderId, newStatus);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px]">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Quản lý Đơn hàng</h2>
            <p className="text-xs text-slate-500">Theo dõi và cập nhật vận đơn</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Mã Đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600 cursor-pointer hover:underline" onClick={() => setSelectedOrder(order)}>
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{order.shippingAddress?.fullName || "N/A"}</p>
                    <p className="text-xs text-slate-400">{order.userId?.email || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#ba1a1a]">
                    {formatVND(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-full outline-none cursor-pointer appearance-none text-center ${STATUS_COLORS[order.status]}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key} className="text-slate-800 bg-white">{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition cursor-pointer" title="Xem chi tiết">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Chi tiết Đơn hàng #{selectedOrder._id.slice(-6).toUpperCase()}</h3>
                <p className="text-sm text-slate-500">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">Thông tin người nhận</h4>
                  <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Họ tên:</span> {selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">SĐT:</span> {selectedOrder.shippingAddress?.phone}</p>
                  <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Địa chỉ:</span> {selectedOrder.shippingAddress?.address}</p>
                  <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Ghi chú:</span> {selectedOrder.shippingAddress?.note || "Không có"}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">Tài khoản đặt hàng</h4>
                  <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Email:</span> {selectedOrder.userId?.email || "N/A"}</p>
                  <p className="text-sm text-slate-600 mt-2"><span className="font-medium text-slate-700">Thanh toán:</span> {selectedOrder.paymentMethod}</p>
                  <p className="text-sm text-slate-600 mt-2 flex items-center gap-2">
                    <span className="font-medium text-slate-700">Trạng thái:</span> 
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[selectedOrder.status]}`}>
                      {STATUS_LABELS[selectedOrder.status]}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Sản phẩm đã mua</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2">Sản phẩm</th>
                        <th className="px-4 py-2 text-center">SL</th>
                        <th className="px-4 py-2 text-right">Đơn giá</th>
                        <th className="px-4 py-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 flex items-center gap-3">
                            <img src={item.image || "/vite.svg"} alt="" className="w-10 h-10 object-cover rounded bg-slate-100" />
                            <span className="font-medium text-slate-800 line-clamp-1">{item.name}</span>
                          </td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatVND(item.price)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatVND(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right font-bold text-slate-700">Tổng cộng:</td>
                        <td className="px-4 py-3 text-right font-bold text-[#ba1a1a] text-lg">{formatVND(selectedOrder.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-sm cursor-pointer">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

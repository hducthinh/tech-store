import React, { useState, useEffect } from "react";
import { ShoppingCart, Eye, Edit, Trash2, Search, Filter } from "lucide-react";
import { Card, Btn, StatusBadge, fmt, EmptyState, PageSkeleton } from "../../components/SharedUI";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import api from "../../services/api";

export default function AdminOrders() {
  useDocumentMeta("Quản lý Đơn hàng - Admin", "Quản lý Đơn hàng TechStore");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmPaymentId, setConfirmPaymentId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/admin");
        setOrders(response.data?.data?.orders || []);
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <PageSkeleton />;

  const handleConfirmPayment = async (orderId) => {
    setIsConfirming(true);
  };

  const confirmPaymentAction = async () => {
    if (!confirmPaymentId) return;
    try {
      setIsConfirming(true);
      const res = await api.patch(`/orders/admin/${confirmPaymentId}/confirm-payment`);
      if (res.data.status === "success") {
        setOrders(orders.map(o => o._id === confirmPaymentId ? res.data.data.order : o));
        if (selectedOrder?._id === confirmPaymentId) setSelectedOrder(res.data.data.order);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi xác nhận thanh toán");
    } finally {
      setIsConfirming(false);
      setConfirmPaymentId(null);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/orders/admin/${selectedOrder._id}/status`, { status: newStatus });
      if (res.data.status === "success") {
        setOrders(orders.map(o => o._id === selectedOrder._id ? res.data.data.order : o));
        setSelectedOrder(res.data.data.order);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Đơn hàng</h1>
          <p className="text-sm text-gray-500">Quản lý và cập nhật trạng thái các đơn đặt hàng</p>
        </div>
        <div className="flex items-center gap-3">
          <Btn variant="outline" className="flex items-center gap-2">
            <Filter size={16} /> Lọc
          </Btn>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState 
          icon={<ShoppingCart size={32} />} 
          title="Chưa có đơn hàng nào" 
          description="Hiện tại chưa có đơn hàng nào được ghi nhận. Đơn hàng mới sẽ xuất hiện tại đây khi khách hàng đặt mua."
          primaryAction={{ label: "Làm mới", onClick: () => window.location.reload() }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm kiếm mã đơn, tên khách hàng..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Mã đơn</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Khách hàng</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Ngày đặt</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Sản phẩm</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Tổng tiền</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => { setSelectedOrder(o); setNewStatus(o.status); }}>#{o._id.substring(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{o.shippingAddress?.fullName || o.userId?.fullName || "Khách"}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{o.items?.length || 0} mục</td>
                    <td className="px-6 py-4 font-bold text-red-600">{fmt(o.totalAmount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button onClick={() => { setSelectedOrder(o); setNewStatus(o.status); }} className="p-1.5 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors"><Eye size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal chi tiết */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none duration-200 p-0">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chi tiết Đơn hàng #{selectedOrder._id.substring(0, 8).toUpperCase()}</h3>
                <p className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors cursor-pointer text-gray-500">
                <Trash2 size={16} className="hidden" /> {/* just to import Trash2 without warnings */}
                <span className="font-bold text-sm">X</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Khách hàng</h4>
                  <p className="text-sm text-gray-700 font-medium">{selectedOrder.shippingAddress?.fullName || selectedOrder.userId?.fullName}</p>
                  <p className="text-sm text-gray-500 mt-1">SĐT: {selectedOrder.shippingAddress?.phone}</p>
                  <p className="text-sm text-gray-500 mt-1">Đ/C: {selectedOrder.shippingAddress?.address}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Thanh toán & Trạng thái</h4>
                  <p className="text-sm text-gray-500 mb-3">Phương thức: <span className="font-medium text-gray-700">{selectedOrder.paymentMethod || "COD"}</span></p>
                  <p className="text-sm text-gray-500 mb-3">Thanh toán: <span className={`font-medium ${selectedOrder.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Sản phẩm</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">Sản phẩm</th>
                        <th className="px-4 py-3 text-center">SL</th>
                        <th className="px-4 py-3 text-right">Đơn giá</th>
                        <th className="px-4 py-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 font-semibold text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">{fmt(item.price)}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">{fmt(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right font-bold text-gray-700">Tổng cộng:</td>
                        <td className="px-4 py-3 text-right font-black text-red-600 text-lg">{fmt(selectedOrder.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex justify-between items-center gap-3 bg-gray-50">
              <div className="flex items-center gap-2">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm bg-white"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipped">Đang giao hàng</option>
                  <option value="delivered">Đã giao hàng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <Btn 
                  variant="primary" 
                  disabled={updatingStatus || newStatus === selectedOrder.status}
                  onClick={handleUpdateStatus}
                >
                  {updatingStatus ? "Đang lưu..." : "Cập nhật"}
                </Btn>
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.paymentMethod === 'BANK_TRANSFER' && !selectedOrder.isPaid && (
                  <Btn 
                    variant="primary" 
                    className="bg-green-600 hover:bg-green-700 text-white border-none"
                    onClick={() => setConfirmPaymentId(selectedOrder._id)}
                  >
                    Xác nhận đã nhận tiền
                  </Btn>
                )}
                <Btn variant="outline" onClick={() => setSelectedOrder(null)}>Đóng</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Confirm Payment Modal */}
      {confirmPaymentId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none duration-200 p-0">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50">
              <h3 className="text-lg font-bold text-green-700">Xác nhận thanh toán</h3>
              <button onClick={() => setConfirmPaymentId(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="p-6">
              <p className="text-gray-700">Xác nhận đã nhận tiền chuyển khoản cho đơn hàng này?</p>
              <p className="text-sm text-gray-500 mt-2">Hành động này sẽ cập nhật trạng thái đơn hàng thành đã thanh toán.</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <Btn type="button" variant="outline" onClick={() => setConfirmPaymentId(null)}>Hủy</Btn>
              <Btn type="button" variant="primary" className="bg-green-600 hover:bg-green-700 border-none text-white" disabled={isConfirming} onClick={confirmPaymentAction}>{isConfirming ? "Đang xử lý..." : "Xác nhận"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

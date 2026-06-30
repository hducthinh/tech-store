import React, { useState } from "react";
import { ShoppingCart, Eye, Filter, Trash2 } from "lucide-react";
import { Card, Btn, StatusBadge, fmt, EmptyState, PageSkeleton } from "../../components/SharedUI";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import api from "../../services/api";
import { AdminTable, AdminSearch, ActionButtons } from "./components/AdminTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useTableData } from "../../hooks/useTableData";
import { useFetchData } from "../../hooks/useFetchData";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import { useCallback } from "react";

export default function AdminOrders() {
  useDocumentMeta("Quản lý Đơn hàng - Admin", "Quản lý Đơn hàng TechStore");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const fetcher = useCallback(async () => {
    const response = await api.get("/orders/admin");
    return response.data?.data?.orders || [];
  }, []);

  const { data: orders, setData: setOrders, loading } = useFetchData(fetcher);

  const {
    isOpen: isConfirmOpen,
    item: _confirmPaymentOrder,
    open: handleOpenConfirmPayment,
    close: closeConfirmPayment,
    isProcessing: isConfirming,
    handleConfirm: confirmPaymentAction
  } = useDeleteConfirmation({
    onConfirm: async (order) => {
      const res = await api.patch(`/orders/admin/${order._id}/confirm-payment`);
      if (res.data.status === "success") {
        setOrders(orders.map(o => o._id === order._id ? res.data.data.order : o));
        if (selectedOrder?._id === order._id) setSelectedOrder(res.data.data.order);
      }
    }
  });

  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const formattedOrders = React.useMemo(() => {
    return orders.map(o => ({
      ...o,
      userName: o.shippingAddress?.fullName || o.userId?.fullName || "Khách",
      userPhone: o.shippingAddress?.phone || o.userId?.phone || "---"
    }));
  }, [orders]);

  const {
    searchQuery, setSearchQuery,
    sortBy, sortOrder, handleSort,
    paginatedData
  } = useTableData({
    data: formattedOrders,
    searchFields: ["_id", "userName", "userPhone"],
    initialSortBy: "createdAt",
    initialSortOrder: "desc"
  });

  const columns = [
    { key: "_id", label: "Mã đơn", sortable: true, render: (o) => <span className="font-bold text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => { setSelectedOrder(o); setNewStatus(o.status); }}>#{String(o._id).substring(0, 8).toUpperCase()}</span> },
    { key: "userName", label: "Khách hàng", sortable: true, render: (o) => <span className="font-semibold text-gray-700">{o.userName}</span> },
    { key: "createdAt", label: "Ngày đặt", sortable: true, render: (o) => <span className="text-gray-500">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</span> },
    { key: "itemsCount", label: "Sản phẩm", render: (o) => <span className="font-medium text-gray-900">{o.items?.length || 0} mục</span> },
    { key: "totalAmount", label: "Tổng tiền", sortable: true, render: (o) => <span className="font-bold text-red-600">{fmt(o.totalAmount)}</span> },
    { key: "status", label: "Trạng thái", sortable: true, render: (o) => <StatusBadge status={o.status} /> },
    { key: "actions", label: "Thao tác", align: "right", render: (o) => (
        <ActionButtons actions={[
          { icon: <Eye size={16}/>, onClick: () => { setSelectedOrder(o); setNewStatus(o.status); }, title: "Chi tiết", className: "hover:bg-blue-50 hover:text-blue-600" }
        ]} />
      )
    }
  ];

  if (loading) return <PageSkeleton />;

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
            <AdminSearch value={searchQuery} onChange={setSearchQuery} placeholder="Tìm kiếm mã đơn, tên khách hàng..." />
          </div>
          <AdminTable 
            columns={columns} 
            data={paginatedData} 
            sortBy={sortBy} 
            sortOrder={sortOrder} 
            onSort={handleSort} 
          />
        </Card>
      )}

      {/* Modal chi tiết */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none p-0">
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
                    onClick={() => handleOpenConfirmPayment(selectedOrder)}
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

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirmPayment}
        onConfirm={confirmPaymentAction}
        title="Xác nhận thanh toán"
        isProcessing={isConfirming}
        isDestructive={false}
        confirmText="Xác nhận"
      >
        <p className="text-gray-700">Xác nhận đã nhận tiền chuyển khoản cho đơn hàng này?</p>
        <p className="text-sm text-gray-500 mt-2">Hành động này sẽ cập nhật trạng thái đơn hàng thành đã thanh toán.</p>
      </ConfirmDialog>
    </div>
  );
}

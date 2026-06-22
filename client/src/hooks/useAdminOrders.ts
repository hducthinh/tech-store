import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function useAdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/admin");
      if (res.data.status === "success") {
        setOrders(res.data.data.orders);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await api.patch(`/orders/admin/${orderId}/status`, { status });
      if (res.data.status === "success") {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi cập nhật trạng thái" };
    }
  };

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    refresh: fetchOrders
  };
}

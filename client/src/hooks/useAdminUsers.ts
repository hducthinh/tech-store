import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/admin");
      if (res.data.status === "success") {
        setUsers(res.data.data.users);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi tải người dùng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = async (userId: string) => {
    try {
      const res = await api.patch(`/users/admin/${userId}/toggle-status`);
      if (res.data.status === "success") {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi cập nhật trạng thái" };
    }
  };

  return {
    users,
    loading,
    error,
    toggleUserStatus,
    refresh: fetchUsers
  };
}

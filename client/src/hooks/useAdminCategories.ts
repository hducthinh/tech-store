import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function useAdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories/admin");
      if (res.data.status === "success") {
        setCategories(res.data.data.categories);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi tải danh mục");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (data: any) => {
    try {
      const res = await api.post("/categories", data);
      if (res.data.status === "success") {
        await fetchCategories();
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi tạo danh mục" };
    }
  };

  const updateCategory = async (id: string, data: any) => {
    try {
      const res = await api.patch(`/categories/${id}`, data);
      if (res.data.status === "success") {
        await fetchCategories();
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi cập nhật danh mục" };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data.status === "success") {
        await fetchCategories();
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi vô hiệu hóa danh mục" };
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh: fetchCategories
  };
}

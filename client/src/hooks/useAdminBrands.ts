import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function useAdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/brands/admin");
      if (res.data.status === "success") {
        setBrands(res.data.data.brands);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi tải thương hiệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const createBrand = async (data: any) => {
    try {
      const res = await api.post("/brands", data);
      if (res.data.status === "success") {
        await fetchBrands();
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi tạo thương hiệu" };
    }
  };

  const updateBrand = async (id: string, data: any) => {
    try {
      const res = await api.patch(`/brands/${id}`, data);
      if (res.data.status === "success") {
        await fetchBrands();
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi cập nhật thương hiệu" };
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      const res = await api.delete(`/brands/${id}`);
      if (res.data.status === "success") {
        await fetchBrands();
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi vô hiệu hóa thương hiệu" };
    }
  };

  return {
    brands,
    loading,
    error,
    createBrand,
    updateBrand,
    deleteBrand,
    refresh: fetchBrands
  };
}

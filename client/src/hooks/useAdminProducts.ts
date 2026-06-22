import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { Product } from "../types";

export function useAdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/admin");
      if (res.data.status === "success") {
        setProducts(res.data.data.products);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (productData: any) => {
    try {
      const res = await api.post("/products", productData);
      if (res.data.status === "success") {
        await fetchProducts(); // Tải lại sau khi tạo
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi tạo sản phẩm" };
    }
  };

  const updateProduct = async (id: string, productData: any) => {
    try {
      const res = await api.patch(`/products/${id}`, productData);
      if (res.data.status === "success") {
        await fetchProducts();
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi cập nhật sản phẩm" };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.status === "success") {
        await fetchProducts();
        return { success: true };
      }
      return { success: false, message: "Lỗi không xác định" };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || "Lỗi vô hiệu hóa sản phẩm" };
    }
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refresh: fetchProducts
  };
}

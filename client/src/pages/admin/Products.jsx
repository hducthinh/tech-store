import React, { useState, useEffect } from "react";
import { Package, Plus, Search, Filter, Edit, Trash2, Eye, Star } from "lucide-react";
import { Card, Btn, fmt, img } from "../../components/SharedUI";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import api from "../../services/api";

export default function AdminProducts() {
  useDocumentMeta("Quản lý Sản phẩm - Admin", "Quản lý Sản phẩm TechStore");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products/admin");
        setProducts(response.data?.data?.products || []);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Đang tải sản phẩm...</div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Sản phẩm</h1>
          <p className="text-sm text-gray-500">Quản lý kho hàng và danh mục sản phẩm</p>
        </div>
        <div className="flex items-center gap-3">
          <Btn variant="outline" className="flex items-center gap-2">
            <Filter size={16} /> Lọc
          </Btn>
          <Btn variant="primary" className="flex items-center gap-2">
            <Plus size={16} /> Thêm sản phẩm
          </Btn>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tên sản phẩm, mã SKU..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Sản phẩm</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Thương hiệu</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Giá bán</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Tồn kho</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 cursor-pointer hover:opacity-80" onClick={() => setSelectedProduct(p)}>
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        <img src={p.thumbnail && p.thumbnail.startsWith("http") ? p.thumbnail : img(p.thumbnail || "1610945415295-d9bbf067e59c")} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 line-clamp-1">{p.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                          <Star size={12} className="fill-amber-500" /> {p.rating || 5} 
                          <span className="text-gray-400">({p.reviews || 0} đánh giá)</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{p.brandName || "Unknown"}</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">{fmt(p.price)}</td>
                  <td className="px-6 py-4">
                    {p.stock > 10 ? (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold">Còn {p.stock}</span>
                    ) : p.stock > 0 ? (
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-bold">Sắp hết ({p.stock})</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold">Hết hàng</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"><Eye size={16}/></button>
                      <button className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded transition-colors"><Edit size={16}/></button>
                      <button className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

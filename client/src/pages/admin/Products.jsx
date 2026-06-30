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

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', categoryId: '', brandId: '', thumbnail: null });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProducts, resCategories, resBrands] = await Promise.all([
        api.get("/products/admin"),
        api.get("/categories"),
        api.get("/brands")
      ]);
      setProducts(resProducts.data?.data?.products || []);
      setCategories(resCategories.data?.data?.categories || []);
      setBrands(resBrands.data?.data?.brands || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('categoryId', formData.categoryId);
      data.append('brandId', formData.brandId);
      if (formData.thumbnail) {
        data.append('thumbnail', formData.thumbnail);
      }
      await api.post("/products", data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsModalOpen(false);
      setFormData({ name: '', price: '', stock: '', categoryId: '', brandId: '', thumbnail: null });
      fetchData();
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm", error);
      alert(error.response?.data?.message || "Lỗi khi thêm sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

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
          <Btn variant="primary" className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold">Thêm sản phẩm mới</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Tên sản phẩm *</label>
                <input required type="text" className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Giá bán *</label>
                  <input required type="number" min="0" className="w-full border rounded p-2" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Tồn kho *</label>
                  <input required type="number" min="0" className="w-full border rounded p-2" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Danh mục *</label>
                  <select required className="w-full border rounded p-2" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Thương hiệu *</label>
                  <select required className="w-full border rounded p-2" value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})}>
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Ảnh đại diện (Thumbnail)</label>
                <input type="file" accept="image/*" className="w-full border rounded p-2" onChange={e => setFormData({...formData, thumbnail: e.target.files[0]})} />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <Btn type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Btn>
                <Btn type="submit" variant="primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu sản phẩm'}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

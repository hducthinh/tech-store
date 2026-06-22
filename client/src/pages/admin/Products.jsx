import React, { useState, useEffect } from "react";
import { Box, Plus, Edit, Trash2, Power, PowerOff, Loader2, X, Check } from "lucide-react";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import api from "../../services/api";

export default function AdminProducts() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useAdminProducts();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    brandId: "",
    price: "",
    stock: "",
    description: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for inline adding
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  useEffect(() => {
    const fetchSelectOptions = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get("/categories"),
          api.get("/brands")
        ]);
        if (catRes.data.status === "success") setCategories(catRes.data.data.categories);
        if (brandRes.data.status === "success") setBrands(brandRes.data.data.brands);
      } catch (err) {
        console.error("Lỗi tải options:", err);
      }
    };
    fetchSelectOptions();
  }, []);

  const handleOpenModal = (product = null) => {
    setFormError("");
    setIsAddingCategory(false);
    setIsAddingBrand(false);
    setNewCategoryName("");
    setNewBrandName("");
    if (product) {
      setEditingId(product._id);
      setFormData({
        name: product.name,
        categoryId: product.categoryId?._id || "",
        brandId: product.brandId?._id || "",
        price: product.price,
        stock: product.stock,
        description: product.description || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        categoryId: categories.length > 0 ? categories[0]._id : "",
        brandId: brands.length > 0 ? brands[0]._id : "",
        price: "",
        stock: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.post("/categories", { name: newCategoryName });
      if (res.data.status === "success") {
        const newCat = res.data.data.category;
        setCategories([...categories, newCat]);
        setFormData({ ...formData, categoryId: newCat._id });
        setIsAddingCategory(false);
        setNewCategoryName("");
      }
    } catch (e) {
      alert("Lỗi khi thêm danh mục: " + (e.response?.data?.message || e.message));
    }
  };

  const handleSaveNewBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      const res = await api.post("/brands", { name: newBrandName });
      if (res.data.status === "success") {
        const newBrand = res.data.data.brand;
        setBrands([...brands, newBrand]);
        setFormData({ ...formData, brandId: newBrand._id });
        setIsAddingBrand(false);
        setNewBrandName("");
      }
    } catch (e) {
      alert("Lỗi khi thêm thương hiệu: " + (e.response?.data?.message || e.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    
    if (isAddingCategory || isAddingBrand) {
      setFormError("Vui lòng hoàn tất việc thêm danh mục/thương hiệu trước khi lưu sản phẩm.");
      return;
    }

    setIsSubmitting(true);
    
    const submitData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock)
    };

    let res;
    if (editingId) {
      res = await updateProduct(editingId, submitData);
    } else {
      res = await createProduct(submitData);
    }

    setIsSubmitting(false);
    if (res.success) {
      handleCloseModal();
    } else {
      setFormError(res.message);
    }
  };

  const handleToggleActive = async (product) => {
    if (window.confirm(`Bạn có chắc muốn ${product.isActive ? "vô hiệu hóa" : "khôi phục"} sản phẩm này?`)) {
      await deleteProduct(product._id);
    }
  };

  const formatVND = (num) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px]">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Quản lý Sản phẩm</h2>
            <p className="text-xs text-slate-500">Thêm mới, cập nhật và quản lý kho hàng</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tên sản phẩm</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3 text-right">Giá</th>
                <th className="px-4 py-3 text-center">Kho</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((p) => (
                <tr key={p._id} className={`hover:bg-slate-50 transition ${!p.isActive && "bg-slate-50/50 opacity-60"}`}>
                  <td className="px-4 py-3 font-mono text-xs">{p._id.slice(-6)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{p.name}</td>
                  <td className="px-4 py-3 text-xs">{p.categoryId?.name || "N/A"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#ba1a1a]">{formatVND(p.price)}</td>
                  <td className="px-4 py-3 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded text-xs ${p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Hiển thị</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full uppercase">Đã ẩn</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition cursor-pointer" title="Chỉnh sửa">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleActive(p)} 
                        className={`p-1.5 rounded transition cursor-pointer ${p.isActive ? "text-red-500 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`} 
                        title={p.isActive ? "Vô hiệu hóa" : "Khôi phục"}
                      >
                        {p.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{formError}</div>}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên sản phẩm *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="VD: Server Dell R740..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-slate-700">Danh mục *</label>
                    {!isAddingCategory && (
                      <button type="button" onClick={() => setIsAddingCategory(true)} className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Thêm mới
                      </button>
                    )}
                  </div>
                  {isAddingCategory ? (
                    <div className="flex items-center gap-2">
                      <input type="text" autoFocus value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="Tên danh mục..." />
                      <button type="button" onClick={handleSaveNewCategory} className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition" title="Lưu">
                        <Check className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setIsAddingCategory(false)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition" title="Hủy">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white">
                      <option value="" disabled>-- Chọn danh mục --</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-slate-700">Thương hiệu *</label>
                    {!isAddingBrand && (
                      <button type="button" onClick={() => setIsAddingBrand(true)} className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Thêm mới
                      </button>
                    )}
                  </div>
                  {isAddingBrand ? (
                    <div className="flex items-center gap-2">
                      <input type="text" autoFocus value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="Tên thương hiệu..." />
                      <button type="button" onClick={handleSaveNewBrand} className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition" title="Lưu">
                        <Check className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setIsAddingBrand(false)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition" title="Hủy">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <select name="brandId" required value={formData.brandId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white">
                      <option value="" disabled>-- Chọn thương hiệu --</option>
                      {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Giá bán (VND) *</label>
                  <input type="number" name="price" required min="0" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Số lượng kho *</label>
                  <input type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả tóm tắt</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" placeholder="Mô tả thông số cơ bản..."></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer">Hủy bỏ</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Box, Plus, Edit, Trash2, Power, PowerOff, Loader2, X, Check, Link } from "lucide-react";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import api from "../../services/api";

export default function AdminProducts() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useAdminProducts();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmToggleModal, setConfirmToggleModal] = useState({ isOpen: false, product: null });
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    brandId: "",
    price: "",
    stock: "",
    description: "",
    specs: [],
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File states
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [currentThumbnail, setCurrentThumbnail] = useState("");
  const [currentImages, setCurrentImages] = useState([]);

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
        specs: product.specs ? Object.entries(product.specs).map(([k, v]) => ({ key: k, value: v })) : [],
      });
      setCurrentThumbnail(product.thumbnail || "");
      setCurrentImages(product.images || []);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        categoryId: categories.length > 0 ? categories[0]._id : "",
        brandId: brands.length > 0 ? brands[0]._id : "",
        price: "",
        stock: "",
        description: "",
        specs: [],
      });
      setCurrentThumbnail("");
      setCurrentImages([]);
    }
    setThumbnailFile(null);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRemoveImage = (index) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditExistingImage = (index) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files[0]) {
        setCurrentImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => [...prev, e.target.files[0]]);
      }
    };
    input.click();
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
    
    // Convert to FormData
    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("categoryId", formData.categoryId);
    formDataObj.append("brandId", formData.brandId);
    formDataObj.append("price", Number(formData.price));
    formDataObj.append("stock", Number(formData.stock));
    formDataObj.append("description", formData.description);

    const specsObj = {};
    if (formData.specs && formData.specs.length > 0) {
      formData.specs.forEach(s => {
        if (s.key && s.value) {
          specsObj[s.key] = s.value;
        }
      });
    }
    formDataObj.append("specs", JSON.stringify(specsObj));

    if (thumbnailFile) {
      formDataObj.append("thumbnail", thumbnailFile);
    } else if (editingId && !currentThumbnail) {
      formDataObj.append("clearThumbnail", "true");
    }

    imageFiles.forEach(file => {
      formDataObj.append("images", file);
    });

    if (currentImages && currentImages.length > 0) {
      currentImages.forEach(img => {
        formDataObj.append("existingImages", img);
      });
    } else if (editingId) {
      formDataObj.append("existingImages", "");
    }

    let res;
    if (editingId) {
      res = await updateProduct(editingId, formDataObj);
    } else {
      res = await createProduct(formDataObj);
    }

    setIsSubmitting(false);
    if (res.success) {
      handleCloseModal();
    } else {
      setFormError(res.message);
    }
  };

  const handleToggleActive = (product) => {
    setConfirmToggleModal({ isOpen: true, product });
  };

  const confirmToggleStatus = async () => {
    const { product } = confirmToggleModal;
    setConfirmToggleModal({ isOpen: false, product: null });
    await deleteProduct(product._id);
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
                    <span className={`px-2 py-0.5 rounded text-xs ${p.stock > 5 ? "bg-green-100 text-green-700" : p.stock > 0 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`} title={p.stock > 0 && p.stock <= 5 ? "Sắp hết hàng" : ""}>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Thông số kỹ thuật (Tùy chọn)</label>
                  <button type="button" onClick={() => setFormData({...formData, specs: [...(formData.specs || []), {key: '', value: ''}]})} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3 h-3" /> Thêm thông số
                  </button>
                </div>
                {formData.specs && formData.specs.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {formData.specs.map((spec, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input type="text" placeholder="Tên (VD: Socket)" value={spec.key} onChange={(e) => {
                          const newSpecs = [...formData.specs];
                          newSpecs[index].key = e.target.value;
                          setFormData({...formData, specs: newSpecs});
                        }} className="w-1/2 px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-amber-500 outline-none text-sm" />
                        <input type="text" placeholder="Giá trị (VD: LGA1700)" value={spec.value} onChange={(e) => {
                          const newSpecs = [...formData.specs];
                          newSpecs[index].value = e.target.value;
                          setFormData({...formData, specs: newSpecs});
                        }} className="w-1/2 px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-amber-500 outline-none text-sm" />
                        <button type="button" onClick={() => {
                          const newSpecs = formData.specs.filter((_, i) => i !== index);
                          setFormData({...formData, specs: newSpecs});
                        }} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Ảnh đại diện (1 ảnh)</label>
                  <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 mb-2" />
                  {currentThumbnail && !thumbnailFile && (
                    <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <a href={currentThumbnail.startsWith('http') ? currentThumbnail : `http://localhost:5000${currentThumbnail}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mb-2 w-max" title={currentThumbnail}>
                        <Link className="w-3 h-3" /> Đường dẫn ảnh
                      </a>
                      <div className="relative group w-32 h-32">
                        <img src={currentThumbnail.startsWith('http') ? currentThumbnail : `http://localhost:5000${currentThumbnail}`} alt="Thumbnail" className="h-full w-full object-contain rounded border border-slate-200 bg-white" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center gap-2">
                          <button type="button" onClick={() => document.querySelector('input[type="file"]').click()} className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-sm" title="Thay đổi ảnh"><Edit className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setCurrentThumbnail("")} className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-sm" title="Xóa ảnh"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  )}
                  {thumbnailFile && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-xs text-amber-600 mb-2 font-medium">Ảnh mới sẽ được cập nhật.</p>
                      <div className="relative group w-32 h-32 mt-2">
                        <img src={URL.createObjectURL(thumbnailFile)} alt="New Thumbnail" className="h-full w-full object-contain rounded border border-amber-200 bg-white" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center gap-2">
                          <button type="button" onClick={() => setThumbnailFile(null)} className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-sm" title="Bỏ chọn ảnh"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Ảnh phụ (Tối đa 5 ảnh)</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(prev => [...prev, ...Array.from(e.target.files).slice(0, 5)])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 mb-2" />
                  {currentImages.length > 0 && (
                    <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <p className="text-xs text-slate-500 mb-2">Đang có {currentImages.length} ảnh (Bạn có thể xóa hoặc thay đổi):</p>
                      <div className="flex gap-2 flex-wrap">
                        {currentImages.map((img, i) => (
                           <div key={i} className="relative group w-20 h-20 bg-white rounded border border-slate-200 flex items-center justify-center">
                              <img src={img.startsWith('http') ? img : `http://localhost:5000${img}`} alt={`Img ${i}`} className="max-h-full max-w-full object-contain" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded flex flex-col items-center justify-center gap-1">
                                <div className="flex gap-1">
                                  <button type="button" onClick={() => handleEditExistingImage(i)} className="p-1 bg-white text-blue-600 rounded-full hover:bg-blue-50" title="Thay đổi"><Edit className="w-3 h-3" /></button>
                                  <button type="button" onClick={() => handleRemoveImage(i)} className="p-1 bg-white text-red-600 rounded-full hover:bg-red-50" title="Xóa"><Trash2 className="w-3 h-3" /></button>
                                </div>
                                <a href={img.startsWith('http') ? img : `http://localhost:5000${img}`} target="_blank" rel="noreferrer" className="p-1 bg-white text-slate-600 rounded-full hover:text-blue-600" title={img}>
                                  <Link className="w-3 h-3" />
                                </a>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {imageFiles.length > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-xs text-amber-600 mb-2 font-medium">Các ảnh mới sẽ được cập nhật ({imageFiles.length}):</p>
                      <div className="flex gap-2 flex-wrap">
                        {imageFiles.map((file, i) => (
                          <div key={i} className="relative group w-20 h-20 bg-white rounded border border-amber-200 flex items-center justify-center">
                            <img src={URL.createObjectURL(file)} alt={`New Img ${i}`} className="max-h-full max-w-full object-contain" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center">
                              <button type="button" onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-sm" title="Xóa ảnh mới"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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

      {/* Confirm Toggle Modal */}
      {confirmToggleModal.isOpen && confirmToggleModal.product && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận thay đổi</h3>
            <p className="text-sm text-slate-600 mb-6">
              Bạn có chắc chắn muốn <span className={`font-bold ${confirmToggleModal.product.isActive ? "text-red-600" : "text-emerald-600"}`}>
                {confirmToggleModal.product.isActive ? "vô hiệu hóa" : "khôi phục"}
              </span> sản phẩm <span className="font-semibold text-slate-800">"{confirmToggleModal.product.name}"</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmToggleModal({ isOpen: false, product: null })} 
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmToggleStatus} 
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition cursor-pointer ${confirmToggleModal.product.isActive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Box, Plus, Loader2 } from "lucide-react";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import api from "../../services/api";

import ProductTable from "../../components/admin/ProductTable";
import ProductFormModal from "../../components/admin/ProductFormModal";

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
        <ProductTable 
          products={products} 
          handleOpenModal={handleOpenModal} 
          handleToggleActive={handleToggleActive} 
        />
      )}

      {/* Modal */}
      <ProductFormModal 
        isModalOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        brands={brands}
        formError={formError}
        isSubmitting={isSubmitting}
        handleSubmit={handleSubmit}
        handleCloseModal={handleCloseModal}
        isAddingCategory={isAddingCategory}
        setIsAddingCategory={setIsAddingCategory}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        handleSaveNewCategory={handleSaveNewCategory}
        isAddingBrand={isAddingBrand}
        setIsAddingBrand={setIsAddingBrand}
        newBrandName={newBrandName}
        setNewBrandName={setNewBrandName}
        handleSaveNewBrand={handleSaveNewBrand}
        handleChange={handleChange}
        thumbnailFile={thumbnailFile}
        setThumbnailFile={setThumbnailFile}
        currentThumbnail={currentThumbnail}
        setCurrentThumbnail={setCurrentThumbnail}
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
        currentImages={currentImages}
        setCurrentImages={setCurrentImages}
        handleEditExistingImage={handleEditExistingImage}
        handleRemoveImage={handleRemoveImage}
      />

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

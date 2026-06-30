import React, { useState } from "react";
import { Package, Plus, Filter, Edit, Trash2, Eye, Star } from "lucide-react";
import { Card, Btn, fmt, img, EmptyState, PageSkeleton } from "../../components/SharedUI";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import api from "../../services/api";
import { AdminTable, AdminSearch, ActionButtons } from "./components/AdminTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useTableData } from "../../hooks/useTableData";
import { useFetchData } from "../../hooks/useFetchData";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import { useCallback } from "react";

export default function AdminProducts() {
  useDocumentMeta("Quản lý Sản phẩm - Admin", "Quản lý Sản phẩm TechStore");
  const fetcher = useCallback(async () => {
    const [resProducts, resCategories, resBrands] = await Promise.all([
      api.get("/products/admin"),
      api.get("/categories"),
      api.get("/brands")
    ]);
    return {
      products: resProducts.data?.data?.products || [],
      categories: resCategories.data?.data?.categories || [],
      brands: resBrands.data?.data?.brands || []
    };
  }, []);

  const { data, loading, refetch: fetchData } = useFetchData(fetcher, { products: [], categories: [], brands: [] });
  const { products, categories, brands } = data;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', categoryId: '', brandId: '', thumbnail: null, previewThumbnail: '' });
  const [submitting, setSubmitting] = useState(false);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStock, setFilterStock] = useState("");

  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchCat = filterCategory ? p.categoryId?._id === filterCategory || p.categoryId === filterCategory : true;
      const matchBrand = filterBrand ? p.brandId?._id === filterBrand || p.brandId === filterBrand : true;
      
      let matchStock = true;
      if (filterStock === "in_stock") matchStock = p.stock > 10;
      else if (filterStock === "low_stock") matchStock = p.stock > 0 && p.stock <= 10;
      else if (filterStock === "out_of_stock") matchStock = p.stock === 0;

      return matchCat && matchBrand && matchStock;
    }).map(p => ({
      ...p,
      brandName: p.brandId?.name || p.brandName || "Unknown",
    }));
  }, [products, filterCategory, filterBrand, filterStock]);

  const {
    searchQuery, setSearchQuery,
    sortBy, sortOrder, handleSort,
    paginatedData,
    currentPage, setCurrentPage, totalPages
  } = useTableData({
    data: filteredProducts,
    searchFields: ["name", "sku"],
    initialSortBy: "createdAt",
    initialSortOrder: "desc",
    itemsPerPage: 10
  });

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId?._id || product.categoryId || '',
        brandId: product.brandId?._id || product.brandId || '',
        thumbnail: null,
        previewThumbnail: (product.thumbnail || (product.images && product.images[0])) ? (product.thumbnail || product.images[0]) : img("1610945415295-d9bbf067e59c")
      });
    } else {
      setFormData({ name: '', price: '', stock: '', categoryId: '', brandId: '', thumbnail: null, previewThumbnail: '' });
    }
    setIsModalOpen(true);
  };

  const {
    isOpen: isDeleteModalOpen,
    item: deletingProduct,
    open: handleOpenDelete,
    close: closeDelete,
    isProcessing: submittingDelete,
    handleConfirm: handleDelete
  } = useDeleteConfirmation({
    onConfirm: async (product) => {
      await api.delete(`/products/${product._id}`);
      fetchData();
    }
  });

  const handleSubmit = async (e) => {
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
      
      if (editingProduct) {
        await api.patch(`/products/${editingProduct._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post("/products", data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      
      setIsModalOpen(false);
      setFormData({ name: '', price: '', stock: '', categoryId: '', brandId: '', thumbnail: null, previewThumbnail: '' });
      fetchData();
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm", error);
      alert(error.response?.data?.message || "Lỗi khi lưu sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };



  const columns = [
    { key: "name", label: "Sản phẩm", sortable: true, render: (p) => (
        <div className="flex items-center gap-4 hover:opacity-80">
          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
            <img 
              src={(p.thumbnail || (p.images && p.images[0])) ? (p.thumbnail || p.images[0]) : img("1610945415295-d9bbf067e59c")} 
              alt={p.name} 
              className="w-full h-full object-cover" 
              onError={(e) => { e.target.src = "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image" }} 
            />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 line-clamp-1">{p.name}</h4>
            <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
              <Star size={12} className="fill-amber-500" /> {p.rating || 5} 
              <span className="text-gray-400">({p.reviews || 0} đánh giá)</span>
            </div>
          </div>
        </div>
      )
    },
    { key: "brandName", label: "Thương hiệu", sortable: true, render: (p) => <span className="text-sm font-semibold text-gray-700">{p.brandName}</span> },
    { key: "price", label: "Giá bán", sortable: true, render: (p) => <span className="text-sm font-bold text-red-600">{fmt(p.price)}</span> },
    { key: "stock", label: "Tồn kho", sortable: true, render: (p) => (
        p.stock > 10 ? (
          <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold whitespace-nowrap">Còn {p.stock}</span>
        ) : p.stock > 0 ? (
          <span className="inline-block px-2 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-bold whitespace-nowrap">Sắp hết ({p.stock})</span>
        ) : (
          <span className="inline-block px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold whitespace-nowrap">Hết hàng</span>
        )
      ) 
    },
    { key: "actions", label: "Thao tác", align: "right", render: (p) => (
        <ActionButtons actions={[
          { icon: <Eye size={16}/>, onClick: () => { /* View details */ }, title: "Chi tiết", className: "hover:bg-blue-50 hover:text-blue-600" },
          { icon: <Edit size={16}/>, onClick: () => handleOpenModal(p), title: "Sửa", className: "hover:bg-amber-50 hover:text-amber-600" },
          { icon: <Trash2 size={16}/>, onClick: () => handleOpenDelete(p), title: "Xóa", className: "hover:bg-red-50 hover:text-red-600" }
        ]} />
      )
    }
  ];

  if (loading) return <PageSkeleton />;

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
          <Btn variant="primary" className="flex items-center gap-2" onClick={() => handleOpenModal()}>
            <Plus size={16} /> Thêm sản phẩm
          </Btn>
        </div>
      </div>

      {products.length === 0 && !searchQuery && !filterCategory && !filterBrand && !filterStock ? (
        <EmptyState 
          icon={<Package size={32} />} 
          title="Chưa có sản phẩm nào" 
          description="Kho hàng của bạn hiện đang trống. Hãy thêm sản phẩm mới để bắt đầu kinh doanh nhé!"
          primaryAction={{ label: "Thêm sản phẩm", icon: <Plus size={16}/>, onClick: () => handleOpenModal() }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-4 bg-white">
            <AdminSearch value={searchQuery} onChange={setSearchQuery} placeholder="Tìm kiếm tên sản phẩm, mã SKU..." />
            <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
                <option value="">Tất cả thương hiệu</option>
                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <select value={filterStock} onChange={e => setFilterStock(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
                <option value="">Tất cả kho hàng</option>
                <option value="in_stock">Còn hàng</option>
                <option value="low_stock">Sắp hết</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>
          </div>
          <AdminTable 
            columns={columns} 
            data={paginatedData} 
            sortBy={sortBy} 
            sortOrder={sortOrder} 
            onSort={handleSort}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Card>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold">{editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Tên sản phẩm *</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Giá bán *</label>
                  <input required type="number" min="0" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Tồn kho *</label>
                  <input required type="number" min="0" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Danh mục *</label>
                  <select required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Thương hiệu *</label>
                  <select required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm" value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})}>
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Ảnh đại diện (Thumbnail)</label>
                {formData.previewThumbnail && (
                  <div className="mb-3 w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img src={formData.previewThumbnail} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image" }} />
                  </div>
                )}
                <input type="file" accept="image/*" className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData({...formData, thumbnail: file, previewThumbnail: URL.createObjectURL(file)});
                  }
                }} />
              </div>
              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Btn type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Btn>
                <Btn type="submit" variant="primary" disabled={submitting}>{submitting ? 'Đang lưu...' : editingProduct ? 'Cập nhật' : 'Lưu sản phẩm'}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={closeDelete}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        isProcessing={submittingDelete}
        confirmText="Xóa sản phẩm"
      >
        <p className="text-gray-700">Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-gray-900">{deletingProduct?.name}</strong> không?</p>
        <p className="text-sm text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
      </ConfirmDialog>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Package, Plus, Search, Filter, Edit, Trash2, Eye, Star, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Card, Btn, fmt, img, EmptyState, PageSkeleton } from "../../components/SharedUI";
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
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', categoryId: '', brandId: '', thumbnail: null, previewThumbnail: '' });
  const [submitting, setSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStock, setFilterStock] = useState("");
  
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = filterCategory ? p.categoryId?._id === filterCategory || p.categoryId === filterCategory : true;
      const matchBrand = filterBrand ? p.brandId?._id === filterBrand || p.brandId === filterBrand : true;
      
      let matchStock = true;
      if (filterStock === "in_stock") matchStock = p.stock > 10;
      else if (filterStock === "low_stock") matchStock = p.stock > 0 && p.stock <= 10;
      else if (filterStock === "out_of_stock") matchStock = p.stock === 0;

      return matchSearch && matchCat && matchBrand && matchStock;
    });
  }, [products, searchQuery, filterCategory, filterBrand, filterStock]);

  const sortedProducts = React.useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "brandName") {
        aVal = a.brandId?.name || a.brandName || "";
        bVal = b.brandId?.name || b.brandName || "";
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortBy, sortOrder]);

  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterBrand, filterStock, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronsUpDown size={14} className="text-gray-400 ml-1 inline opacity-50 group-hover:opacity-100 transition-opacity" />;
    return sortOrder === "asc" ? <ChevronUp size={14} className="text-blue-600 ml-1 inline" /> : <ChevronDown size={14} className="text-blue-600 ml-1 inline" />;
  };

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

  const handleOpenDelete = (product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

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

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setSubmitting(true);
    try {
      await api.delete(`/products/${deletingProduct._id}`);
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xóa");
    } finally {
      setSubmitting(false);
    }
  };

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
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm kiếm tên sản phẩm, mã SKU..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
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

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase text-xs cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort("name")}>
                    Sản phẩm <SortIcon field="name" />
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort("brandName")}>
                    Thương hiệu <SortIcon field="brandName" />
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort("price")}>
                    Giá bán <SortIcon field="price" />
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => handleSort("stock")}>
                    Tồn kho <SortIcon field="stock" />
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500">
                      <Search size={32} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-base font-semibold text-gray-900">Không tìm thấy sản phẩm nào</p>
                      <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      <Btn variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setFilterCategory(""); setFilterBrand(""); setFilterStock(""); }}>Xóa bộ lọc</Btn>
                    </td>
                  </tr>
                ) : paginatedProducts.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 cursor-pointer hover:opacity-80" onClick={() => setSelectedProduct(p)}>
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
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{p.brandName || "Unknown"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">{fmt(p.price)}</td>
                    <td className="px-6 py-4">
                      {p.stock > 10 ? (
                        <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold whitespace-nowrap">Còn {p.stock}</span>
                      ) : p.stock > 0 ? (
                        <span className="inline-block px-2 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-bold whitespace-nowrap">Sắp hết ({p.stock})</span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold whitespace-nowrap">Hết hàng</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"><Eye size={16}/></button>
                        <button onClick={() => handleOpenModal(p)} className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded transition-colors"><Edit size={16}/></button>
                        <button onClick={() => handleOpenDelete(p)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <span className="text-sm text-gray-500">
                Hiển thị <span className="font-semibold text-gray-900">{filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> trong số <span className="font-semibold text-gray-900">{filteredProducts.length}</span> kết quả
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1 hidden sm:flex">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button 
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-1 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold">{editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
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
                {formData.previewThumbnail && (
                  <div className="mb-3 w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img src={formData.previewThumbnail} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image" }} />
                  </div>
                )}
                <input type="file" accept="image/*" className="w-full border rounded p-2 text-sm" onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData({...formData, thumbnail: file, previewThumbnail: URL.createObjectURL(file)});
                  }
                }} />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <Btn type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Btn>
                <Btn type="submit" variant="primary" disabled={submitting}>{submitting ? 'Đang lưu...' : editingProduct ? 'Cập nhật' : 'Lưu sản phẩm'}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none duration-200 p-0">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
              <h3 className="text-lg font-bold text-red-700">Xác nhận xóa</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="p-6">
              <p className="text-gray-700">Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-gray-900">{deletingProduct?.name}</strong> không?</p>
              <p className="text-sm text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <Btn type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Hủy</Btn>
              <Btn type="button" variant="danger" disabled={submitting} onClick={handleDelete}>{submitting ? "Đang xóa..." : "Xóa sản phẩm"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

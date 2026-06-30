import React, { useState, useEffect } from "react";
import { Tag, Plus, Search, Edit, PowerOff, Trash2 } from "lucide-react";
import { Card, Btn, EmptyState, PageSkeleton } from "../../components/SharedUI";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import api from "../../services/api";

export default function AdminBrands() {
  useDocumentMeta("Quản lý Thương hiệu - Admin", "Quản lý Thương hiệu TechStore");
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get("/brands/admin");
      setBrands(response.data?.data?.brands || []);
    } catch (error) {
      console.error("Lỗi tải thương hiệu", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenModal = (brand = null) => {
    setEditingBrand(brand);
    setFormData(brand ? { name: brand.name } : { name: '' });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (brand) => {
    setDeletingBrand(brand);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBrand) {
        await api.patch(`/brands/${editingBrand._id}`, formData);
      } else {
        await api.post("/brands", formData);
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xử lý");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBrand) return;
    setSubmitting(true);
    try {
      await api.delete(`/brands/${deletingBrand._id}`);
      setIsDeleteModalOpen(false);
      setDeletingBrand(null);
      fetchBrands();
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
          <h1 className="text-2xl font-black text-gray-900 mb-1">Thương hiệu</h1>
          <p className="text-sm text-gray-500">Quản lý các nhãn hàng và nhà cung cấp</p>
        </div>
        <Btn variant="primary" className="flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Thêm thương hiệu
        </Btn>
      </div>

      {brands.length === 0 ? (
        <EmptyState 
          icon={<Tag size={32} />} 
          title="Chưa có thương hiệu nào" 
          description="Bắt đầu bằng cách thêm thương hiệu đầu tiên để phân loại sản phẩm của bạn."
          primaryAction={{ label: "Thêm thương hiệu", icon: <Plus size={16}/>, onClick: () => handleOpenModal() }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm kiếm thương hiệu..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">ID</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Tên Thương hiệu</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-center">Sản phẩm</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-center">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {brands.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500">{String(b._id).substring(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{b.name}</td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">{b.products || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        Hoạt động
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button onClick={() => handleOpenModal(b)} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"><Edit size={16}/></button>
                        <button onClick={() => handleOpenDelete(b)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none duration-200 p-0">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">{editingBrand ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tên thương hiệu <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm transition-all" 
                    placeholder="Nhập tên thương hiệu..." 
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <Btn type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Btn>
                <Btn type="submit" variant="primary" disabled={submitting}>{submitting ? "Đang xử lý..." : editingBrand ? "Cập nhật" : "Tạo mới"}</Btn>
              </div>
            </form>
          </Card>
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
              <p className="text-gray-700">Bạn có chắc chắn muốn xóa thương hiệu <strong className="text-gray-900">{deletingBrand?.name}</strong> không?</p>
              <p className="text-sm text-gray-500 mt-2">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <Btn type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Hủy</Btn>
              <Btn type="button" variant="danger" disabled={submitting} onClick={handleDelete}>{submitting ? "Đang xóa..." : "Xóa thương hiệu"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

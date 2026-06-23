import React, { useState } from "react";
import { FolderTree, Plus, Edit, Power, PowerOff, Loader2 } from "lucide-react";
import { useAdminCategories } from "../../hooks/useAdminCategories";

export default function AdminCategories() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useAdminCategories();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmToggleModal, setConfirmToggleModal] = useState({ isOpen: false, category: null });
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (category = null) => {
    setFormError("");
    if (category) {
      setEditingId(category._id);
      setFormData({ name: category.name });
    } else {
      setEditingId(null);
      setFormData({ name: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);
    
    let res;
    if (editingId) {
      res = await updateCategory(editingId, formData);
    } else {
      res = await createCategory(formData);
    }

    setIsSubmitting(false);
    if (res.success) {
      handleCloseModal();
    } else {
      setFormError(res.message);
    }
  };

  const handleToggleActive = (category) => {
    setConfirmToggleModal({ isOpen: true, category });
  };

  const confirmToggleStatus = async () => {
    const { category } = confirmToggleModal;
    setConfirmToggleModal({ isOpen: false, category: null });
    await deleteCategory(category._id);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px]">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Quản lý Danh mục</h2>
            <p className="text-xs text-slate-500">Phân loại sản phẩm</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tên danh mục</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categories.map((c) => (
                <tr key={c._id} className={`hover:bg-slate-50 transition ${!c.isActive && "bg-slate-50/50 opacity-60"}`}>
                  <td className="px-4 py-3 font-mono text-xs">{c._id.slice(-6)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{c.slug}</td>
                  <td className="px-4 py-3 text-center">
                    {c.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Hiển thị</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full uppercase">Đã ẩn</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition cursor-pointer" title="Chỉnh sửa">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleActive(c)} 
                        className={`p-1.5 rounded transition cursor-pointer ${c.isActive ? "text-red-500 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`} 
                        title={c.isActive ? "Vô hiệu hóa" : "Khôi phục"}
                      >
                        {c.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{formError}</div>}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên danh mục *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="VD: Laptop, PC..." />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer">Hủy bỏ</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Toggle Modal */}
      {confirmToggleModal.isOpen && confirmToggleModal.category && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận thay đổi</h3>
            <p className="text-sm text-slate-600 mb-6">
              Bạn có chắc chắn muốn <span className={`font-bold ${confirmToggleModal.category.isActive ? "text-red-600" : "text-emerald-600"}`}>
                {confirmToggleModal.category.isActive ? "vô hiệu hóa" : "khôi phục"}
              </span> danh mục <span className="font-semibold text-slate-800">"{confirmToggleModal.category.name}"</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmToggleModal({ isOpen: false, category: null })} 
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmToggleStatus} 
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition cursor-pointer ${confirmToggleModal.category.isActive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
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

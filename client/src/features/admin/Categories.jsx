import React, { useState } from "react";
import { FolderTree, Plus, Edit, Trash2 } from "lucide-react";
import { Card, Btn, EmptyState, PageSkeleton } from "../../components/SharedUI";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import api from "../../services/api";
import { AdminTable, AdminSearch, ActionButtons } from "./components/AdminTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useTableData } from "../../hooks/useTableData";
import { useFetchData } from "../../hooks/useFetchData";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import { useCallback } from "react";

export default function AdminCategories() {
  useDocumentMeta("Quản lý Danh mục - Admin", "Quản lý Danh mục TechStore");

  const fetcher = useCallback(async () => {
    const response = await api.get("/categories/admin");
    return response.data?.data?.categories || [];
  }, []);

  const { data: categories, loading, refetch: fetchCategories } = useFetchData(fetcher);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    setFormData(category ? { name: category.name, icon: category.icon || '' } : { name: '', icon: '' });
    setIsModalOpen(true);
  };

  const {
    isOpen: isDeleteModalOpen,
    item: deletingCategory,
    open: handleOpenDelete,
    close: closeDelete,
    isProcessing: submittingDelete,
    handleConfirm: handleDelete
  } = useDeleteConfirmation({
    onConfirm: async (category) => {
      await api.delete(`/categories/${category._id}`);
      fetchCategories();
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory._id}`, formData);
      } else {
        await api.post("/categories", formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xử lý");
    } finally {
      setSubmitting(false);
    }
  };



  const {
    searchQuery, setSearchQuery,
    sortBy, sortOrder, handleSort,
    paginatedData
  } = useTableData({
    data: categories,
    searchFields: ["name", "slug"],
    initialSortBy: "name",
    initialSortOrder: "asc"
  });

  const columns = [
    { key: "_id", label: "ID", render: (c) => <span className="font-mono text-gray-500">{String(c._id).substring(0, 8).toUpperCase()}</span> },
    { key: "name", label: "Danh mục", sortable: true, render: (c) => (
        <div className="flex items-center gap-3">
          <div className="text-2xl">{c.icon || "📁"}</div>
          <div>
            <div className="font-bold text-gray-900">{c.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{c.slug}</div>
          </div>
        </div>
      ) 
    },
    { key: "products", label: "Sản phẩm", align: "center", sortable: true, render: (c) => <span className="font-semibold text-gray-700">{c.products || 0}</span> },
    { key: "status", label: "Trạng thái", align: "center", render: () => (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
          Hoạt động
        </span>
      ) 
    },
    { key: "actions", label: "Thao tác", align: "right", render: (c) => (
        <ActionButtons actions={[
          { icon: <Edit size={16}/>, onClick: () => handleOpenModal(c), title: "Sửa", className: "hover:bg-blue-50 hover:text-blue-600" },
          { icon: <Trash2 size={16}/>, onClick: () => handleOpenDelete(c), title: "Xóa", className: "hover:bg-red-50 hover:text-red-600" }
        ]} />
      )
    }
  ];

  if (loading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Danh mục</h1>
          <p className="text-sm text-gray-500">Phân loại và cấu trúc cây danh mục sản phẩm</p>
        </div>
        <Btn variant="primary" className="flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Thêm danh mục
        </Btn>
      </div>

      {categories.length === 0 ? (
        <EmptyState 
          icon={<FolderTree size={32} />} 
          title="Chưa có danh mục nào" 
          description="Tạo danh mục đầu tiên để tổ chức và phân loại sản phẩm của bạn một cách khoa học."
          primaryAction={{ label: "Thêm danh mục", icon: <Plus size={16}/>, onClick: () => handleOpenModal() }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
            <AdminSearch value={searchQuery} onChange={setSearchQuery} placeholder="Tìm kiếm danh mục..." />
          </div>
          <AdminTable 
            columns={columns} 
            data={paginatedData} 
            sortBy={sortBy} 
            sortOrder={sortOrder} 
            onSort={handleSort} 
          />
        </Card>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none duration-200 p-0">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">{editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tên danh mục <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm transition-all" 
                    placeholder="Nhập tên danh mục..." 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Icon / Emoji</label>
                  <input 
                    type="text" 
                    value={formData.icon}
                    onChange={e => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm transition-all" 
                    placeholder="🖥️" 
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <Btn type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Btn>
                <Btn type="submit" variant="primary" disabled={submitting}>{submitting ? "Đang xử lý..." : editingCategory ? "Cập nhật" : "Tạo mới"}</Btn>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={closeDelete}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        isProcessing={submittingDelete}
        confirmText="Xóa danh mục"
      >
        <p className="text-gray-700">Bạn có chắc chắn muốn xóa danh mục <strong className="text-gray-900">{deletingCategory?.name}</strong> không?</p>
        <p className="text-sm text-gray-500 mt-2">Tất cả sản phẩm thuộc danh mục này có thể bị ảnh hưởng. Hành động này không thể hoàn tác.</p>
      </ConfirmDialog>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { FolderTree, Plus, Search, Edit, PowerOff, Power } from "lucide-react";
import { Card, Btn, fmt } from "../../components/SharedUI";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import api from "../../services/api";

export default function AdminCategories() {
  useDocumentMeta("Quản lý Danh mục - Admin", "Quản lý Danh mục TechStore");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories/admin");
        setCategories(response.data?.data?.categories || []);
      } catch (error) {
        console.error("Lỗi tải danh mục", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Đang tải danh mục...</div>;

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

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

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm danh mục..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs">ID</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs">Danh mục</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-center">Sản phẩm</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map(c => (
                <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">{String(c._id).substring(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{c.icon || "📁"}</div>
                      <div>
                        <div className="font-bold text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{c.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-700">{c.products}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                      Hoạt động
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button onClick={() => handleOpenModal(c)} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"><Edit size={16}/></button>
                      <button className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors"><PowerOff size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 p-0">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tên danh mục <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  defaultValue={editingCategory?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm transition-all" 
                  placeholder="Nhập tên danh mục..." 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Icon / Emoji</label>
                <input 
                  type="text" 
                  defaultValue={editingCategory?.icon || editingCategory?.img}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm transition-all" 
                  placeholder="🖥️" 
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <Btn variant="outline" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Btn>
              <Btn variant="primary">{editingCategory ? "Cập nhật" : "Tạo mới"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

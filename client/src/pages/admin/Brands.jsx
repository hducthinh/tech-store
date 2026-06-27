import React, { useState } from "react";
import { Tag, Plus, Search, Edit, PowerOff } from "lucide-react";
import { Card, Btn } from "../../components/SharedUI";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

const MOCK_BRANDS = [
  { id: "b1", name: "Apple", products: 124, status: "active" },
  { id: "b2", name: "Samsung", products: 98, status: "active" },
  { id: "b3", name: "Sony", products: 45, status: "active" },
  { id: "b4", name: "Dell", products: 67, status: "active" },
  { id: "b5", name: "Asus", products: 82, status: "active" },
];

export default function AdminBrands() {
  useDocumentMeta("Quản lý Thương hiệu - Admin", "Quản lý Thương hiệu TechStore");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const handleOpenModal = (brand = null) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

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
              {MOCK_BRANDS.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">{b.id.toUpperCase()}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{b.name}</td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-700">{b.products}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                      Hoạt động
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button onClick={() => handleOpenModal(b)} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"><Edit size={16}/></button>
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
              <h3 className="text-lg font-bold text-gray-900">{editingBrand ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tên thương hiệu <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  defaultValue={editingBrand?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm transition-all" 
                  placeholder="Nhập tên thương hiệu..." 
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <Btn variant="outline" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Btn>
              <Btn variant="primary">{editingBrand ? "Cập nhật" : "Tạo mới"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

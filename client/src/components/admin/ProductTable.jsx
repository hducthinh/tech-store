import React from "react";
import { Edit, Power, PowerOff } from "lucide-react";

export default function ProductTable({ products, handleOpenModal, handleToggleActive }) {
  const formatVND = (num) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

  return (
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
  );
}

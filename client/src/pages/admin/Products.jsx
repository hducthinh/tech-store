import React from "react";
import { Box } from "lucide-react";

export default function AdminProducts() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[500px] flex flex-col items-center justify-center text-center">
      <div className="p-4 bg-amber-50 text-amber-600 rounded-full mb-4">
        <Box className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Quản lý Sản phẩm</h2>
      <p className="text-slate-500 max-w-md">
        Tính năng thêm mới, sửa, xóa, và quản lý kho linh kiện (Stock) sẽ được xây dựng tại đây.
      </p>
    </div>
  );
}

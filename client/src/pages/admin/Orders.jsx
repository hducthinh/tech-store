import React from "react";
import { ShoppingCart } from "lucide-react";

export default function AdminOrders() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[500px] flex flex-col items-center justify-center text-center">
      <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
        <ShoppingCart className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Quản lý Đơn hàng</h2>
      <p className="text-slate-500 max-w-md">
        Tính năng quản lý, duyệt đơn và thay đổi trạng thái đơn hàng (Đang giao, Hoàn tất, Hủy) sẽ được xây dựng tại đây.
      </p>
    </div>
  );
}

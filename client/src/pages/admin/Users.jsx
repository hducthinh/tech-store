import React from "react";
import { Users } from "lucide-react";

export default function AdminUsers() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[500px] flex flex-col items-center justify-center text-center">
      <div className="p-4 bg-purple-50 text-purple-600 rounded-full mb-4">
        <Users className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Quản lý Khách hàng</h2>
      <p className="text-slate-500 max-w-md">
        Tính năng xem danh sách người dùng, quản lý quyền hạn (Role) và khóa tài khoản sẽ được xây dựng tại đây.
      </p>
    </div>
  );
}

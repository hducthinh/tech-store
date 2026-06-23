import React from "react";
import { Users, Loader2, UserCheck, UserX } from "lucide-react";
import { useAdminUsers } from "../../hooks/useAdminUsers";

export default function AdminUsers() {
  const { users, loading, toggleUserStatus } = useAdminUsers();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
    });
  };

  const handleToggleStatus = async (user) => {
    const res = await toggleUserStatus(user._id);
    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px]">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Quản lý Khách hàng</h2>
            <p className="text-xs text-slate-500">Danh sách tài khoản và phân quyền</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3 text-center">Số điện thoại</th>
                <th className="px-4 py-3 text-center">Vai trò</th>
                <th className="px-4 py-3 text-center">Ngày đăng ký</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">{user.fullName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs">{user.phone || "N/A"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold uppercase bg-emerald-100 text-emerald-700">
                        <UserCheck className="w-3 h-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold uppercase bg-rose-100 text-rose-700">
                        <UserX className="w-3 h-3" /> Bị khóa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex justify-center">
                    {/* Toggle Button */}
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                        user.isActive ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                    >
                      <span className="sr-only">Toggle status</span>
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          user.isActive ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                    Không có người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

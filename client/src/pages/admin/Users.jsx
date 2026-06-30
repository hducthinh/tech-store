import React, { useState, useEffect } from "react";
import { Users, Search, Filter, ShieldCheck, ShieldAlert, Edit, Trash2 } from "lucide-react";
import { Card, Btn, EmptyState, PageSkeleton } from "../../components/SharedUI";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import api from "../../services/api";

export default function AdminUsers() {
  useDocumentMeta("Quản lý Khách hàng - Admin", "Quản lý Khách hàng TechStore");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenConfirm = (user) => {
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`/users/admin/${selectedUser._id}/toggle-status`);
      if (res.data.status === "success") {
        setUsers(users.map(u => u._id === selectedUser._id ? res.data.data.user : u));
      }
      setIsConfirmOpen(false);
      setSelectedUser(null);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users/admin");
        setUsers(response.data?.data?.users || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Khách hàng</h1>
          <p className="text-sm text-gray-500">Quản lý tài khoản và phân quyền người dùng</p>
        </div>
        <div className="flex items-center gap-3">
          <Btn variant="outline" className="flex items-center gap-2">
            <Filter size={16} /> Lọc
          </Btn>
          <Btn variant="primary" className="flex items-center gap-2">
            Xuất danh sách
          </Btn>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState 
          icon={<Users size={32} />} 
          title="Chưa có khách hàng nào" 
          description="Danh sách khách hàng sẽ được cập nhật khi có người dùng đăng ký tài khoản mới."
          primaryAction={{ label: "Làm mới", onClick: () => window.location.reload() }}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm kiếm tên, email, sđt..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Khách hàng</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Số điện thoại</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-center">Vai trò</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-center">Ngày đăng ký</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-center">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {u.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{u.fullName}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{u.phone || "---"}</td>
                    <td className="px-6 py-4 text-center">
                      {u.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-bold">
                          <ShieldCheck size={12} /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {u.isActive ? (
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold uppercase tracking-wider">Hoạt động</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold uppercase tracking-wider">
                          <ShieldAlert size={12} /> Bị khóa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button onClick={() => handleOpenConfirm(u)} title={u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"} className={`p-1.5 rounded transition-colors ${u.isActive ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-green-50 hover:text-green-600'}`}>
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Confirm Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none duration-200 p-0">
            <div className={`p-6 border-b border-gray-100 flex justify-between items-center ${selectedUser?.isActive ? 'bg-red-50' : 'bg-green-50'}`}>
              <h3 className={`text-lg font-bold ${selectedUser?.isActive ? 'text-red-700' : 'text-green-700'}`}>
                {selectedUser?.isActive ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
              </h3>
              <button onClick={() => setIsConfirmOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="p-6">
              <p className="text-gray-700">Bạn có chắc chắn muốn {selectedUser?.isActive ? 'khóa' : 'mở khóa'} tài khoản <strong className="text-gray-900">{selectedUser?.fullName}</strong> ({selectedUser?.email}) không?</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <Btn type="button" variant="outline" onClick={() => setIsConfirmOpen(false)}>Hủy</Btn>
              <Btn type="button" variant={selectedUser?.isActive ? 'danger' : 'primary'} disabled={submitting} onClick={handleToggleStatus}>{submitting ? "Đang xử lý..." : "Xác nhận"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

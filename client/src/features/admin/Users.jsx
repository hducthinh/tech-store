import React from "react";
import { Users, Filter, ShieldCheck, ShieldAlert, Trash2 } from "lucide-react";
import { Card, Btn, EmptyState, PageSkeleton } from "../../components/SharedUI";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import api from "../../services/api";
import { AdminTable, AdminSearch, ActionButtons } from "./components/AdminTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useTableData } from "../../hooks/useTableData";
import { useFetchData } from "../../hooks/useFetchData";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import { useCallback } from "react";

export default function AdminUsers() {
  useDocumentMeta("Quản lý Khách hàng - Admin", "Quản lý Khách hàng TechStore");
  const fetcher = useCallback(async () => {
    const response = await api.get("/users/admin");
    return response.data?.data?.users || [];
  }, []);

  const { data: users, setData: setUsers, loading } = useFetchData(fetcher);

  const {
    isOpen: isConfirmOpen,
    item: selectedUser,
    open: handleOpenConfirm,
    close: closeConfirm,
    isProcessing: submittingDelete,
    handleConfirm: handleToggleStatus
  } = useDeleteConfirmation({
    onConfirm: async (user) => {
      const res = await api.patch(`/users/admin/${user._id}/toggle-status`);
      if (res.data.status === "success") {
        setUsers(users.map(u => u._id === user._id ? res.data.data.user : u));
      }
    }
  });



  const {
    searchQuery, setSearchQuery,
    sortBy, sortOrder, handleSort,
    paginatedData
  } = useTableData({
    data: users,
    searchFields: ["fullName", "email", "phone"],
    initialSortBy: "createdAt",
    initialSortOrder: "desc"
  });

  const columns = [
    { key: "user", label: "Khách hàng", render: (u) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            {u.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-gray-900">{u.fullName}</div>
            <div className="text-xs text-gray-500">{u.email}</div>
          </div>
        </div>
      )
    },
    { key: "phone", label: "Số điện thoại", render: (u) => <span className="font-medium text-gray-700">{u.phone || "---"}</span> },
    { key: "isAdmin", label: "Vai trò", align: "center", sortable: true, render: (u) => (
        u.isAdmin ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-bold">
            <ShieldCheck size={12} /> Admin
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">
            User
          </span>
        )
      )
    },
    { key: "createdAt", label: "Ngày đăng ký", align: "center", sortable: true, render: (u) => <span className="text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString("vi-VN")}</span> },
    { key: "isActive", label: "Trạng thái", align: "center", sortable: true, render: (u) => (
        u.isActive ? (
          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold uppercase tracking-wider">Hoạt động</span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold uppercase tracking-wider">
            <ShieldAlert size={12} /> Bị khóa
          </span>
        )
      ) 
    },
    { key: "actions", label: "Thao tác", align: "right", render: (u) => (
        <ActionButtons actions={[
          { icon: <Trash2 size={16}/>, onClick: () => handleOpenConfirm(u), title: u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản", className: u.isActive ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-green-50 hover:text-green-600' }
        ]} />
      )
    }
  ];

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
            <AdminSearch value={searchQuery} onChange={setSearchQuery} placeholder="Tìm kiếm tên, email, sđt..." />
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

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleToggleStatus}
        title={selectedUser?.isActive ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
        isProcessing={submittingDelete}
        isDestructive={selectedUser?.isActive}
        confirmText="Xác nhận"
      >
        <p className="text-gray-700">Bạn có chắc chắn muốn {selectedUser?.isActive ? 'khóa' : 'mở khóa'} tài khoản <strong className="text-gray-900">{selectedUser?.fullName}</strong> ({selectedUser?.email}) không?</p>
      </ConfirmDialog>
    </div>
  );
}

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminRoute() {
  const { user, isInitialized } = useAuth();

  // Đợi cho đến khi AuthContext đã kiểm tra token xong
  if (!isInitialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập hoặc không phải admin thì đá ra trang chủ
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import StoreDashboard from "../components/ui/StoreDashboard";
import { useNavigate } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function Home({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useDocumentMeta(
    "Trang chủ", 
    "Hệ thống phân phối thiết bị máy chủ, workstation và linh kiện cao cấp dành riêng cho Data Engineer, Developer."
  );

  return (
    <StoreDashboard 
      userEmail={user?.email || ""} 
      onLogout={logout} 
      onLoginClick={() => navigate("/login")}
    >
      {children}
    </StoreDashboard>
  );
}

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import StoreDashboard from "../components/ui/StoreDashboard";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <StoreDashboard 
      userEmail={user?.email || ""} 
      onLogout={logout} 
      onLoginClick={() => navigate("/login")}
    />
  );
}

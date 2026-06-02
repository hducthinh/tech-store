// src/components/common/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar"; // ✅ Import từ common
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 bg-white shadow-md"
      style={{ border: "2px solid green" }}
    >
      {/* Top bar: Logo + Search + Cart + Auth */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          PC Shop
        </Link>

        <div className="flex-1 max-w-xl mx-8">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/cart" className="text-2xl">
            🛒
          </Link>

          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700 font-medium">
                Chào, {user.fullName}
              </span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded text-sm transition"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
      {/* Navbar - thanh điều hướng */}
      <Navbar /> {/* ✅ Dùng component Navbar */}
    </header>
  );
};

export default Header;

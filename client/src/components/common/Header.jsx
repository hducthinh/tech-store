// src/components/common/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar"; // ✅ Import từ common

const Header = () => {
  return (
    <header
      className="sticky top-0 z-50 bg-white shadow-md"
      style={{ border: "2px solid green" }}
    >
      {/* Top bar: Logo + Search + Cart */}
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

        <Link to="/cart" className="text-2xl">
          🛒
        </Link>
      </div>
      {/* Navbar - thanh điều hướng */}
      <Navbar /> {/* ✅ Dùng component Navbar */}
    </header>
  );
};

export default Header;

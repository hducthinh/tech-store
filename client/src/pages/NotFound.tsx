import React from "react";
import { Link } from "react-router-dom";
import { Wrench, Settings, Bot } from "lucide-react";
import UserLayout from "../components/layouts/UserLayout";

export default function NotFound() {
  return (
    <UserLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 text-center px-4">
        {/* Decorative Mascot/Icon Area */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-100 rounded-full blur-3xl opacity-50"></div>
          <div className="relative z-10 flex items-center justify-center bg-white w-48 h-48 rounded-full shadow-lg border-4 border-red-50">
            <Bot size={80} className="text-red-600" />
            <Wrench size={32} className="text-gray-400 absolute top-8 right-8 rotate-45" />
            <Settings size={40} className="text-red-400 absolute bottom-6 left-6 animate-spin-slow" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
          Đường dẫn đã hết hạn truy cập hoặc không tồn tại
        </h1>
        <p className="text-gray-600 text-sm md:text-base mb-8">
          Quý khách có thể liên hệ tổng đài miễn phí <strong className="text-red-600">1800 6601</strong> để được hỗ trợ
        </p>

        {/* CTA Button */}
        <Link
          to="/"
          className="bg-[#D32F2F] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </UserLayout>
  );
}

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to Đức Thịnh Tech Store
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Find the best electronic products here.
      </p>

      <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Trạng thái kiểm thử Đăng nhập/Đăng ký
        </h2>

        {user ? (
          <div className="text-left space-y-3">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between mb-4">
              <span className="font-medium">✓ Đã đăng nhập thành công!</span>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong className="text-gray-900">Họ và tên:</strong>{" "}
                {user.fullName}
              </p>
              <p>
                <strong className="text-gray-900">Email:</strong> {user.email}
              </p>
              <p>
                <strong className="text-gray-900">Số điện thoại:</strong>{" "}
                {user.phone}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <span>Bạn chưa đăng nhập hệ thống.</span>
            </div>
            <p className="text-sm text-gray-600">
              Vui lòng sử dụng các nút dưới đây hoặc trên thanh điều hướng để thử
              nghiệm chức năng.
            </p>
            <div className="flex space-x-3 justify-center">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Đăng nhập ngay
              </Link>
              <Link
                to="/register"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg transition border border-gray-300"
              >
                Đăng ký tài khoản
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

// src/pages/ProductList.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/products/ProductCard";

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy state từ query params (để dễ dàng share URL)
  const search = searchParams.get("search") || "";
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt_desc");

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams(searchParams).toString();
        const res = await api.get(`/products?${query}`);
        setProducts(res.data.data.products);
      } catch (_err) {
        setError("Không thể tải danh sách sản phẩm.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const handleFilter = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (minPrice) newParams.set("minPrice", minPrice);
    else newParams.delete("minPrice");
    if (maxPrice) newParams.set("maxPrice", maxPrice);
    else newParams.delete("maxPrice");
    newParams.set("sortBy", sortBy);
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Lọc */}
      <div className="w-full md:w-1/4 lg:w-1/5 bg-white p-5 rounded-lg shadow-sm border border-gray-100 self-start md:sticky md:top-4">
        <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Bộ Lọc
        </h2>
        
        <form onSubmit={handleFilter}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá (₫)</label>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                placeholder="Từ (VD: 100000)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
              />
              <input
                type="number"
                placeholder="Đến (VD: 500000)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp theo</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="createdAt_desc">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="soldCount_desc">Bán chạy nhất</option>
              <option value="rating_desc">Đánh giá cao</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 transition">
            Áp dụng bộ lọc
          </button>
        </form>
      </div>

      {/* Vùng Grid Sản phẩm */}
      <div className="w-full md:w-3/4 lg:w-4/5">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">
            {search ? `Kết quả tìm kiếm: "${search}"` : "Tất cả sản phẩm"}
          </h1>
          <span className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">{products.length} sản phẩm</span>
        </div>

        {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg mb-4">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-100 shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;

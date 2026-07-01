import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Star, ShoppingCart, Filter, ChevronRight, X, Heart, Eye, Flame } from "lucide-react";
import { fmt, img, Card } from "../../components/SharedUI";
import { ProductSkeleton } from "../../components/ui/ProductSkeleton";
import UserLayout from "../../components/layouts/UserLayout";
import NotFound from "../../pages/NotFound";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import { useCart } from "../../contexts/CartContext";
import { useAlert } from "../../contexts/AlertContext";
import api from "../../services/api";

const PRICE_RANGES = [
  { id: "range1", label: "Dưới 1,000,000₫", min: 0, max: 1000000 },
  { id: "range2", label: "1,000,000₫ - 2,000,000₫", min: 1000000, max: 2000000 },
  { id: "range3", label: "2,000,000₫ - 5,000,000₫", min: 2000000, max: 5000000 },
  { id: "range4", label: "5,000,000₫ - 10,000,000₫", min: 5000000, max: 10000000 },
  { id: "range5", label: "Trên 10,000,000₫", min: 10000000, max: null },
];

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Hàng mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "soldCount_desc", label: "Bán chạy nhất" },
];

const Sidebar = ({ filters, actions }) => {
  const { sortBy, displayBrands, showAllBrands, selectedBrands, minPrice, maxPrice } = filters;
  const { handleSortChange, toggleBrand, setShowAllBrands, togglePriceRange } = actions;
  
  return (
    <div className="space-y-8">
      {/* Sort Filter */}
      <div>
        <h3 className="font-bold text-sm uppercase text-gray-900 mb-4 tracking-wider">Sắp xếp</h3>
        <select
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          value={sortBy}
          onChange={handleSortChange}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="h-px bg-gray-200"></div>

      {/* Brands Filter */}
      {displayBrands.length > 0 && (
      <div>
        <h3 className="font-bold text-sm uppercase text-gray-900 mb-4 tracking-wider">Hãng Sản Xuất</h3>
        <div className="space-y-3">
          {(showAllBrands ? displayBrands : displayBrands.slice(0, 5)).map(brand => (
            <label key={brand._id} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-all"
                  checked={selectedBrands.includes(brand._id)}
                  onChange={() => toggleBrand(brand._id)}
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{brand.name}</span>
            </label>
          ))}
        </div>
        {displayBrands.length > 5 && (
          <button
            className="mt-3 text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"
            onClick={() => setShowAllBrands(!showAllBrands)}
          >
            {showAllBrands ? "Thu gọn" : "Xem thêm"}
            <ChevronRight size={14} className={`transform transition-transform ${showAllBrands ? "-rotate-90" : "rotate-90"}`} />
          </button>
        )}
      </div>
      )}

      <div className="h-px bg-gray-200"></div>

      {/* Price Filter */}
      <div>
        <h3 className="font-bold text-sm uppercase text-gray-900 mb-4 tracking-wider">Giá</h3>
        <div className="space-y-3">
          {PRICE_RANGES.map(range => (
            <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-all"
                  checked={minPrice == range.min && maxPrice == (range.max || "")}
                  onChange={() => togglePriceRange(range)}
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(null);
  const [categoryNotFound, setCategoryNotFound] = useState(false);
  const [baseDataLoading, setBaseDataLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, page: 1, total: 0 });

  const { addToCart } = useCart();
  const { showToast } = useAlert();

  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Read filters from URL
  const selectedBrands = searchParams.getAll("brand");
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sort") || "createdAt_desc";
  const searchQuery = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useDocumentMeta(
    searchQuery 
      ? `Tìm kiếm: ${searchQuery} - DucThinh TechShop`
      : category ? `${category.name} - DucThinh TechShop` : "Sản phẩm - DucThinh TechShop", 
    "Danh mục sản phẩm"
  );

  useEffect(() => {
    const fetchBaseData = async () => {
      setBaseDataLoading(true);
      try {
        const brandRes = await api.get(`/brands`);
        setBrands(brandRes.data?.data?.brands || []);

        if (slug && slug !== 'all') {
          try {
            const catRes = await api.get(`/categories/${slug}`);
            if (catRes.data?.data?.category) {
              setCategory(catRes.data.data.category);
              setCategoryNotFound(false);
            } else {
              setCategoryNotFound(true);
            }
          } catch (e) {
            console.error("Lỗi lấy thông tin danh mục:", e);
            setCategory(null);
            setCategoryNotFound(true);
          }
        } else {
          setCategory(null);
          setCategoryNotFound(false);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu trang:", err);
      } finally {
        setBaseDataLoading(false);
      }
    };
    fetchBaseData();
  }, [slug]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (slug && slug !== 'all') {
          params.append("category", slug);
        }
        if (selectedBrands.length > 0) {
          selectedBrands.forEach(b => params.append("brandId", b));
        }
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (sortBy) params.append("sortBy", sortBy);
        if (searchQuery) params.append("search", searchQuery);
        params.append("page", currentPage.toString());

        const prodRes = await api.get(`/products?${params.toString()}`);
        setProducts(prodRes.data?.data?.products || []);
        if (prodRes.data?.pagination) setPagination(prodRes.data.pagination);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, searchParams.toString()]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvailableBrands([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, searchQuery]);

  useEffect(() => {
    if (products.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailableBrands(prev => {
        const uniqueBrands = new Map(prev.map(b => [b._id, b]));
        products.forEach(p => {
          if (p.brandId && p.brandName && !uniqueBrands.has(p.brandId)) {
            uniqueBrands.set(p.brandId, { _id: p.brandId, name: p.brandName });
          }
        });
        return Array.from(uniqueBrands.values());
      });
    }
  }, [products]);

  const displayBrands = availableBrands.length > 0 ? availableBrands : brands;

  const toggleBrand = (brandId) => {
    const newParams = new URLSearchParams(searchParams);
    const currentBrands = newParams.getAll("brand");
    newParams.delete("brand");
    if (currentBrands.includes(brandId)) {
      currentBrands.filter(b => b !== brandId).forEach(b => newParams.append("brand", b));
    } else {
      [...currentBrands, brandId].forEach(b => newParams.append("brand", b));
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePriceRange = (range) => {
    const newParams = new URLSearchParams(searchParams);
    const currentMin = newParams.get("minPrice");
    const currentMax = newParams.get("maxPrice");

    // Toggle off if clicking the same range
    if (currentMin == range.min && currentMax == (range.max || "")) {
      newParams.delete("minPrice");
      newParams.delete("maxPrice");
    } else {
      if (range.min !== null) newParams.set("minPrice", range.min);
      else newParams.delete("minPrice");

      if (range.max !== null) newParams.set("maxPrice", range.max);
      else newParams.delete("maxPrice");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", e.target.value);
    newParams.set("page", "1");
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarProps = {
    filters: { sortBy, displayBrands, showAllBrands, selectedBrands, minPrice, maxPrice },
    actions: { handleSortChange, toggleBrand, setShowAllBrands, togglePriceRange }
  };

  if (baseDataLoading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </UserLayout>
    );
  }

  if (categoryNotFound) {
    return <NotFound />;
  }

  return (
    <UserLayout>
      <div className="bg-gray-50 min-h-screen py-6">
        <div className="max-w-7xl mx-auto px-4">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-gray-500">Danh mục</span>
            {category && (
              <>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-semibold">{category.name}</span>
              </>
            )}
          </nav>

          <div className="md:hidden flex justify-end mb-4">
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold bg-white shadow-sm"
              onClick={() => setShowMobileFilter(true)}
            >
              <Filter size={16} /> Lọc & Sắp xếp
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <Sidebar {...sidebarProps} />
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {showMobileFilter && (
              <div className="fixed inset-0 z-50 flex lg:hidden">
                <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)}></div>
                <div className="relative w-80 max-w-full bg-white h-full flex flex-col animate-in slide-in-from-left duration-300">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-lg">Bộ lọc</h2>
                    <button onClick={() => setShowMobileFilter(false)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    <Sidebar {...sidebarProps} />
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => setShowMobileFilter(false)}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                    >
                      Xem {products.length} kết quả
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content: Products Grid */}
            <main className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="text-gray-300" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-500">Hãy thử xóa bớt các điều kiện lọc để xem thêm kết quả.</p>
                  <button
                    onClick={() => setSearchParams(new URLSearchParams())}
                    className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map(p => (
                      <Link key={p._id} to={`/products/${p.slug || p._id}`} className="block">
                        <Card className="overflow-hidden group cursor-pointer flex flex-col h-full w-full bg-white hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100">
                          <div className="relative h-48 md:h-56 bg-gray-100 overflow-hidden">
                            <img
                              src={p.images?.[0] || p.thumbnail || img("1610945415295-d9bbf067e59c")}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                            />
                            
                            <div className="absolute top-3 left-3 flex flex-row items-center gap-2">
                              {p.originalPrice > p.price ? (
                                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded w-max shadow-sm">-{Math.round((1 - p.price / p.originalPrice) * 100)}%</span>
                              ) : (
                                <span className="text-red-500 text-[12px] font-black px-1 py-1 flex items-center gap-1 w-max drop-shadow-sm uppercase tracking-wider"><Flame size={16} className="fill-red-500 text-red-500 animate-pulse" /> HOT</span>
                              )}
                              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm w-max shadow-[0_0_8px_rgba(37,99,235,0.4)] border border-blue-400/30">TRẢ GÓP 0%</span>
                            </div>

                            <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-red-50 shadow-md" onClick={(e) => e.preventDefault()}>
                                <Heart size={16} />
                              </button>
                              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 shadow-md" onClick={(e) => e.preventDefault()}>
                                <Eye size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col bg-white">
                            <div className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">{p.brandName || p.brand || "TechStore"}</div>
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors text-sm md:text-base leading-snug">{p.name}</h3>
                            <div className="flex items-center gap-1.5 mb-4">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-gray-700">{p.rating || 5}</span>
                              <span className="text-xs text-gray-400">({p.soldCount || 0} đã bán)</span>
                            </div>
                            <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                              <div className="flex flex-col gap-1">
                                <div className="font-black text-red-600 text-base md:text-lg">{fmt(p.price)}</div>
                                {p.originalPrice > p.price && (
                                  <div className="text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</div>
                                )}
                              </div>
                              <button
                                className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  const success = await addToCart(p._id, 1);
                                  if (success) showToast(`Đã thêm ${p.name} vào giỏ hàng`, "success");
                                }}
                              >
                                <ShoppingCart size={18} />
                              </button>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-colors text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="rotate-180" size={18} />
                      </button>
                      
                      {Array.from({ length: pagination.totalPages }).map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`w-10 h-10 rounded-xl font-bold transition-colors ${
                            pagination.page === i + 1
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-colors text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

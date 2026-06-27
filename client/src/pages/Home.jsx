import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowRight, Star, Zap, ShieldCheck, Truck, Clock, ShoppingCart } from "lucide-react";
import { fmt, img, Btn, Card } from "../components/SharedUI";
import UserLayout from "../components/layouts/UserLayout";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useCart } from "../contexts/CartContext";
import { useAlert } from "../contexts/AlertContext";
import api from "../services/api";

function HomeContent() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products?sortBy=soldCount_desc&limit=8"),
        ]);
        setCategories(catRes.data?.data?.categories || []);
        setProducts(prodRes.data?.data?.products || []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gray-900 rounded-3xl overflow-hidden relative group h-[400px]">
              <img src={img("1610945415295-d9bbf067e59c", 1200, 800)} alt="Hero" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-10 md:p-14">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-4 w-max">Siêu Sale 2026</span>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">Galaxy S24 Ultra<br />Titanium</h1>
                <p className="text-gray-300 mb-8 max-w-sm text-lg">Quyền năng AI mới. Camera 200MP đột phá.</p>
                <div className="flex gap-4">
                  <Btn variant="primary" size="lg" className="px-8 rounded-full">Mua ngay</Btn>
                  <Btn variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8">Tìm hiểu thêm</Btn>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 relative overflow-hidden group cursor-pointer">
                <div className="relative z-10">
                  <h3 className="font-black text-xl mb-2">MacBook Pro M3</h3>
                  <p className="text-blue-600 font-bold mb-4">Từ 39.990.000₫</p>
                  <span className="text-sm font-semibold hover:underline flex items-center gap-1">Khám phá <ArrowRight size={14} /></span>
                </div>
                <img src={img("1517336714731-489689fd1ca8")} alt="Macbook" className="absolute -bottom-10 -right-10 w-48 h-48 object-cover rounded-full border-4 border-white shadow-xl group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 relative overflow-hidden group cursor-pointer text-white">
                <div className="relative z-10">
                  <h3 className="font-black text-xl mb-2">Sony WH-1000XM5</h3>
                  <p className="text-gray-400 font-bold mb-4">Chống ồn đỉnh cao</p>
                  <span className="text-sm font-semibold hover:underline flex items-center gap-1 text-gray-300">Mua ngay <ArrowRight size={14} /></span>
                </div>
                <img src={img("1505740420928-5e560c06d30e")} alt="Sony" className="absolute -bottom-8 -right-8 w-40 h-40 object-cover rounded-full border-4 border-gray-700 shadow-xl group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Truck size={24} />, title: "Giao hàng miễn phí", desc: "Đơn hàng từ 500k" },
              { icon: <ShieldCheck size={24} />, title: "Bảo hành chính hãng", desc: "Đổi trả trong 30 ngày" },
              { icon: <Zap size={24} />, title: "Giá tốt nhất", desc: "Cam kết rẻ nhất thị trường" },
              { icon: <Clock size={24} />, title: "Hỗ trợ 24/7", desc: "Luôn sẵn sàng phục vụ" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{f.title}</h4>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black mb-2">Danh mục nổi bật</h2>
              <p className="text-gray-500">Tìm kiếm sản phẩm theo danh mục</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories
              .filter(c => ["VGA", "CPU", "Mainboard", "RAM", "Ổ cứng SSD", "Màn hình", "Bàn phím", "Chuột"].includes(c.name))
              .concat(categories.filter(c => !["VGA", "CPU", "Mainboard", "RAM", "Ổ cứng SSD", "Màn hình", "Bàn phím", "Chuột"].includes(c.name)))
              .slice(0, 6)
              .map(c => (
              <Card
                key={c._id}
                onClick={() => navigate(`/collections/${c.slug}`)}
                className={`p-6 text-center hover:shadow-md transition-shadow cursor-pointer hover:border-blue-200 group`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{c.icon || "📦"}</div>
                <h3 className={`font-bold transition-colors text-gray-900 group-hover:text-blue-600`}>{c.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{c.products || 0} sản phẩm</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black mb-2">Sản phẩm bán chạy</h2>
              <p className="text-gray-500">Được khách hàng tin dùng nhiều nhất</p>
            </div>
            <button className="text-blue-600 font-semibold hover:underline hidden md:flex items-center gap-1">
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</div>
            ) : (
              products.map(p => (
                <Link key={p._id} to={`/products/${p.slug || p._id}`} className="block">
                  <Card className="overflow-hidden group cursor-pointer flex flex-col h-full hover:shadow-lg transition-shadow">
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      <img src={p.images?.[0] || p.thumbnail || img("1610945415295-d9bbf067e59c")} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">HOT</span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="text-xs text-gray-500 mb-2">{p.brandName || p.brand}</div>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">{p.name}</h3>
                      <div className="flex items-center gap-1 mb-4">
                        <Star size={14} className="fill-amber-500 text-amber-500" />
                        <span className="text-sm font-semibold">{p.rating || 5}</span>
                        <span className="text-xs text-gray-400">({p.soldCount || 0} đã bán)</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="font-black text-red-600 text-lg">{fmt(p.price)}</div>
                        <button
                          className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(p._id, 1);
                            showToast(`Đã thêm ${p.name} vào giỏ hàng`, "success");
                          }}
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </Card>
                </Link>
              )))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home({ children }) {
  useDocumentMeta(
    "Trang chủ - TechCart",
    "Hệ thống phân phối thiết bị máy chủ, workstation và linh kiện cao cấp dành riêng cho Data Engineer, Developer."
  );

  return (
    <UserLayout>
      {children || <HomeContent />}
    </UserLayout>
  );
}

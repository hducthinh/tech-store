import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Menu, X, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Btn, fmt, img } from "../SharedUI";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

export default function UserLayout({ children }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { cart, cartCount, removeFromCart, updateQuantity } = useCart();
  const { user, logout } = useAuth();
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  useEffect(() => {
    // Select all items by default when cart changes or drawer opens
    if (cart?.items) {
      setSelectedItemIds(cart.items.map(i => i.productId?._id).filter(Boolean));
    }
  }, [cart?.items, cartOpen]);

  const toggleItemSelection = (id) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data?.data?.categories || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCats();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 shrink-0 cursor-pointer mr-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">TC</span>
            </div>
            <span className="text-lg font-black text-blue-600 hidden sm:block">TechCart</span>
          </button>

          <div className="relative group hidden md:block">
            <button className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0">
              <Menu size={20} />
              Danh mục
            </button>
            <div className={`absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden ${categories.length > 10 ? 'w-auto' : 'w-64'}`}>
              <div className="py-2 flex">
                {categories.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 w-64">Đang tải...</div>
                ) : (
                  Array.from({ length: Math.ceil(categories.length / 10) }).map((_, colIndex) => (
                    <div key={colIndex} className="w-64 border-r last:border-r-0 border-gray-100">
                      {categories.slice(colIndex * 10, (colIndex + 1) * 10).map(c => (
                        <Link key={c._id} to={`/collections/${c.slug}`} className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group/item">
                          <span className="text-xl mr-3">{c.icon || "📦"}</span>
                          <span className="font-medium text-gray-700 group-hover/item:text-blue-600 truncate">{c.name}</span>
                          <ChevronRight size={16} className="ml-auto text-gray-400 group-hover/item:text-blue-600 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-4 relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  navigate(`/collections/all?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <ShoppingCart size={20} className="text-gray-900" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <User size={18} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-900">{user.fullName || "Tài khoản"}</span>
                </button>
                {user.role === "admin" && (
                  <button onClick={() => navigate("/admin")} className="text-sm font-bold text-blue-600 hover:underline">
                    Admin Panel
                  </button>
                )}
                <button onClick={() => { logout(); navigate("/"); }} className="text-sm font-semibold text-gray-500 hover:text-red-600">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Btn variant="primary" size="sm" onClick={() => navigate("/login")} className="hidden md:flex">Đăng nhập</Btn>
            )}
            <button className="md:hidden p-2" onClick={() => setMobileMenu(o => !o)}>
              <Menu size={20} />
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 flex flex-col gap-2">
            {["Điện thoại", "Laptop", "Tai nghe", "Phụ kiện"].map(c => (
              <button key={c} className="text-sm text-left py-1.5 text-gray-900 font-semibold">{c}</button>
            ))}
            <div className="flex gap-2 pt-2 border-t border-gray-200">
              <Btn variant="outline" size="sm" onClick={() => navigate("/login")}>Đăng nhập</Btn>
              <Btn variant="primary" size="sm" onClick={() => navigate("/register")}>Đăng ký</Btn>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-[#0F1C3F] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xs font-black">TC</span>
              </div>
              <span className="font-black text-lg">TechCart</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">Cửa hàng công nghệ hàng đầu Việt Nam.</p>
          </div>
          {[
            { title: "Hỗ trợ", links: ["Trung tâm trợ giúp", "Chính sách đổi trả", "Bảo hành"] },
            { title: "Công ty", links: ["Về chúng tôi", "Tuyển dụng", "Liên hệ"] },
            { title: "Liên hệ", links: ["1800 6789", "support@techcart.vn", "Hà Nội, Việt Nam"] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-bold mb-3 text-sm">{col.title}</h4>
              <ul className="space-y-2">{col.links.map(l => <li key={l} className="text-white/60 text-sm hover:text-white cursor-pointer transition-colors">{l}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 py-4 text-center text-white/40 text-xs">
          © 2026 TechCart. All rights reserved.
        </div>
      </footer>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setCartOpen(false)}>
          <div 
            className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">Giỏ hàng ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {cartCount === 0 && <p className="text-gray-500 text-center mt-10">Giỏ hàng trống</p>}
              {cart?.items?.map((item, idx) => {
                const product = item.productId || {};
                const image = product.thumbnail || product.images?.[0] || "1610945415295-d9bbf067e59c";
                const isSelected = selectedItemIds.includes(product._id);
                return (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItemSelection(product._id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    <img src={image.startsWith("http") || image.startsWith("data:") ? image : img(image, 200, 200)} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{product.name}</h4>
                    <span className="text-red-600 font-bold text-sm mt-auto">{fmt(product.price)}</span>
                    <div className="flex items-center justify-between mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-100 rounded">
                          <button type="button" onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">-</button>
                          <input 
                            type="text" 
                            value={item.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                updateQuantity(product._id, "");
                              } else {
                                const num = parseInt(val.replace(/\D/g, ''));
                                if (!isNaN(num)) updateQuantity(product._id, num);
                              }
                            }}
                            onBlur={() => {
                              if (item.quantity === "" || item.quantity < 1) updateQuantity(product._id, 1);
                            }}
                            className="w-8 text-center text-xs font-semibold bg-transparent border-none p-0 focus:ring-0" 
                          />
                          <button type="button" onClick={() => updateQuantity(product._id, (Number(item.quantity) || 0) + 1)} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(product._id)} className="text-red-500 text-xs font-semibold hover:underline">Xóa</button>
                    </div>
                  </div>
                </div>
              )})}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                <span>Tổng cộng:</span>
                <span className="text-red-600 text-lg">
                  {fmt(cart?.items?.filter(item => selectedItemIds.includes(item.productId?._id)).reduce((a, b) => a + (b.productId?.price || b.price || 0) * b.quantity, 0) || 0)}
                </span>
              </div>
              <Btn size="lg" disabled={selectedItemIds.length === 0} onClick={() => { setCartOpen(false); navigate("/checkout", { state: { selectedItemIds } }); }} className="w-full justify-center">
                Tiến hành thanh toán
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

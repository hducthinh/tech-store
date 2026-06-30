import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Menu, MapPin, Phone, Mail, Clock, Monitor, Truck, ShieldCheck, MessageCircle, ChevronUp, Cpu, Box, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Btn, fmt, img } from "../SharedUI";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import CartDrawer from "../common/CartDrawer";

function getCategoryIcon(name) {
  if (!name) return <Box size={18} strokeWidth={1.5} className="text-gray-500 group-hover/item:text-blue-600 transition-colors" />;
  const n = name.toLowerCase();
  let iconName = '';

  if (n.includes('cpu') || n.includes('vi xử lý')) iconName = 'cpu.svg';
  else if (n.includes('mainboard') || n.includes('bo mạch')) iconName = 'mainboard.svg';
  else if (n.includes('ram') || n.includes('bộ nhớ')) iconName = 'ram.svg';
  else if (n.includes('vga') || n.includes('card màn hình')) iconName = 'vga.svg';
  else if (n.includes('ssd') || n.includes('ổ cứng')) iconName = 'ssd.svg';
  else if (n.includes('nguồn') || n.includes('psu')) iconName = 'power.svg';
  else if (n.includes('case') || n.includes('vỏ máy')) iconName = 'case.svg';
  else if (n.includes('tản nhiệt') || n.includes('fan') || n.includes('cooler')) iconName = 'fan.svg';
  else if (n.includes('giá treo') || n.includes('arm')) iconName = 'arm.svg';
  else if (n.includes('màn hình') || n.includes('monitor')) iconName = 'monitor.svg';
  else if (n.includes('bàn phím') || n.includes('keyboard')) iconName = 'keyboard.svg';
  else if (n.includes('chuột') || n.includes('mouse')) {
    if (n.includes('lót') || n.includes('pad')) iconName = 'mousepad.svg';
    else iconName = 'mouse.svg';
  }
  else if (n.includes('tai nghe') || n.includes('headphone')) iconName = 'headphone.svg';
  else if (n.includes('loa') || n.includes('speaker')) iconName = 'speaker.svg';
  else if (n.includes('ghế') || n.includes('chair')) iconName = 'chair.svg';

  if (iconName) {
    return <img src={`/icons/${iconName}`} alt={name} className="w-5 h-5 object-contain opacity-70 group-hover/item:opacity-100 transition-opacity filter-none group-hover/item:brightness-125" />;
  }
  return <Box size={18} strokeWidth={1.5} className="text-gray-500 group-hover/item:text-blue-600 transition-colors" />;
}

export default function UserLayout({ children }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [menuProducts, setMenuProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products?limit=3&sort=-soldCount")
        ]);
        setCategories(catRes.data?.data?.categories || []);
        setMenuProducts(prodRes.data?.data?.products || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCats();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-[#1e293b] text-gray-300 text-[13px] py-1.5 px-4 hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Truck size={14} className="text-blue-400" /> Miễn phí vận chuyển đơn từ 2.000.000đ</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-400" /> Bảo hành chính hãng 100%</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-semibold text-white"><Phone size={14} className="text-blue-400" /> Hotline: 1900 1234</span>
            <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors"><MapPin size={14} className="text-blue-400" /> Hệ thống cửa hàng</span>
          </div>
        </div>
      </div>

      <header className={`bg-white border-b border-gray-200 sticky top-0 z-30 transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer shrink-0 group mr-6">
            <img src="/header_logo_cropped.png" alt="Đức Thịnh Techshop" className="h-[40px] w-auto object-contain" />
          </button>

          <div className="relative group hidden md:block">
            <button className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0">
              <Menu size={20} />
              Danh mục
            </button>
            <div className="absolute top-full left-0 pt-2 w-[850px] opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
              <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
                <div className="p-6 grid grid-cols-12 gap-8">
                  {/* Categories Column */}
                  <div className="col-span-5 border-r border-gray-100 pr-4">
                    <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Menu size={18} className="text-blue-600" /> Danh mục sản phẩm</h3>
                    {categories.length === 0 ? (
                      <div className="text-sm text-gray-500">Đang tải...</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map(c => (
                          <Link key={c._id} to={`/collections/${c.slug}`} className="flex items-center px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors group/item">
                            <span className="mr-3 flex items-center justify-center w-6 h-6">{getCategoryIcon(c.name)}</span>
                            <span className="text-[13px] font-semibold text-gray-700 group-hover/item:text-blue-600 truncate">{c.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Popular Products Column */}
                  <div className="col-span-4 border-r border-gray-100 pr-4">
                    <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><Zap size={18} className="text-amber-500 fill-amber-500" /> Sản phẩm nổi bật</h3>
                    <div className="flex flex-col gap-4">
                      {menuProducts.map(p => (
                        <Link key={p._id} to={`/products/${p.slug || p._id}`} className="flex gap-3 items-center group/prod">
                          <div className="w-16 h-16 bg-gray-50 rounded-lg p-1 shrink-0 group-hover/prod:shadow-md transition-shadow">
                            <img src={p.images?.[0] || p.thumbnail || img("1517336714731-489689fd1ca8")} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-gray-800 line-clamp-2 group-hover/prod:text-blue-600 transition-colors">{p.name}</p>
                            <p className="text-red-500 font-bold text-sm mt-1">{fmt(p.price)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Promotional Banner */}
                  <div className="col-span-3">
                    <div className="w-full h-full bg-slate-900 rounded-2xl p-5 text-white flex flex-col relative overflow-hidden group/banner cursor-pointer shadow-inner" onClick={() => navigate("/xay-dung-cau-hinh")}>
                      {/* Background layers */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-800/90 z-0"></div>
                      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

                      {/* Glowing orbs */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover/banner:scale-150 transition-transform duration-700 z-0"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 rounded-full blur-[30px] translate-y-1/2 -translate-x-1/2 group-hover/banner:scale-150 transition-transform duration-700 z-0"></div>

                      {/* Image / Decorative Icons */}
                      <Cpu size={140} strokeWidth={0.5} className="absolute bottom-[-30px] right-[-30px] text-white opacity-10 rotate-12 group-hover/banner:scale-110 group-hover/banner:opacity-20 group-hover/banner:rotate-6 transition-all duration-700 z-10" />
                      <Monitor size={60} strokeWidth={1} className="absolute bottom-[60px] right-[70px] text-blue-200 opacity-10 -rotate-12 group-hover/banner:scale-125 group-hover/banner:opacity-30 transition-all duration-700 z-10 delay-100" />

                      {/* Content */}
                      <div className="relative z-20 flex flex-col h-full">
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black px-2 py-1 rounded w-max mb-3 shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-white/20 tracking-wider">GIẢM ĐẾN 50%</span>
                        <h4 className="font-black text-xl leading-tight mb-2 drop-shadow-md tracking-tight">BUILD PC<br />SIÊU ƯU ĐÃI</h4>
                        <p className="text-blue-100 text-[11px] mb-4 opacity-90 font-medium">Tặng balo chống sốc & chuột</p>
                        <button className="mt-auto bg-white/10 backdrop-blur-md border border-white/30 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg hover:bg-white hover:text-blue-700 transition-all z-10 w-max group-hover/banner:shadow-[0_0_20px_rgba(255,255,255,0.3)]">Khám phá ngay</button>
                      </div>
                    </div>
                  </div>
                </div>
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
                  navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              placeholder="Bạn đang tìm kiếm gì?"
              className="w-full pl-10 pr-4 h-[42px] bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
            />
          </div>

          <Link to="/xay-dung-cau-hinh" className="hidden lg:flex items-center gap-2 px-4 h-[42px] bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow-md shadow-red-500/20 transition-all shrink-0 ml-2">
            <Monitor size={18} />
            Tự build cấu hình
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group"
            >
              <ShoppingCart size={20} className="text-blue-600 group-hover:text-blue-700" />
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
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <User size={16} className="text-gray-600" />
                  </div>
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
      <footer className="bg-white text-gray-800 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Column 1: Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center mb-6">
              <img src="/header_logo_cropped.png" alt="Đức Thịnh Techshop" className="h-[36px] w-auto object-contain" />
            </div>
            <div className="flex gap-3 text-sm">
              <MapPin className="shrink-0 text-gray-600 mt-1" size={16} />
              <div>
                <p><strong>Địa chỉ:</strong> 08 Hà Văn Tính, Hòa Khánh, Đà Nẵng.</p>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <Clock className="shrink-0 text-gray-600 mt-1" size={16} />
              <div>
                <p><strong>Giờ làm việc:</strong></p>
                <p>T2-T7 : 9h00 - 18h30, CN : 9h00 - 16h00</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="shrink-0 text-gray-600" size={16} />
              <p><strong>Số điện thoại:</strong> 0857540568</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="shrink-0 text-gray-600" size={16} />
              <p><strong>Email:</strong> support@dthinhtech.shop</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <a href="https://www.facebook.com/realDucThinh" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" /></svg></a>
              <a href="https://github.com/hducthinh" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900 transition-colors"><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg></a>
            </div>
          </div>

          {/* Column 2: Về TechShop */}
          <div className="md:col-span-2">
            <h4 className="font-bold mb-4 text-gray-900 text-base">Về ĐỨC THỊNH TECHSHOP</h4>
            <ul className="space-y-3">
              {["Giới thiệu", "Blog công nghệ", "Tin khuyến mãi"].map(link => (
                <li key={link} className="text-gray-600 text-sm hover:text-blue-600 cursor-pointer transition-colors">{link}</li>
              ))}
            </ul>
          </div>

          {/* Column 3: Chính sách */}
          <div className="md:col-span-3">
            <h4 className="font-bold mb-4 text-gray-900 text-base">Chính sách</h4>
            <ul className="space-y-3">
              {["Quy định Bảo Hành", "Phương thức Thanh toán", "Giao nhận - Vận chuyển", "Trả Góp Lãi Suất 0%", "Chính sách bảo mật"].map(link => (
                <li key={link} className="text-gray-600 text-sm hover:text-blue-600 cursor-pointer transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  {link}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Hỗ trợ & Thanh toán */}
          <div className="md:col-span-3">
            <h4 className="font-bold mb-4 text-gray-900 text-base">Tổng đài hỗ trợ</h4>
            <ul className="space-y-3 text-sm text-gray-600 mb-8">
              <li>Gọi mua hàng: <span className="text-blue-600 font-semibold">0857540568</span> (9h-18h)</li>
              <li>Gọi bảo hành: <span className="text-blue-600 font-semibold">0857540568</span> (9h-18h)</li>
              <li>Gọi kỹ thuật: <span className="text-blue-600 font-semibold">0857540568</span> (9h-18h)</li>
              <li>Gọi khiếu nại: <span className="text-blue-600 font-semibold">0857540568</span> (9h-18h)</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4 text-left text-gray-500 text-sm">
          © Bản quyền thuộc về ĐỨC THỊNH TECHSHOP
        </div>
      </footer>

      {/* Cart Drawer Component */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Floating Actions */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <button className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all group">
          <MessageCircle size={24} className="group-hover:animate-pulse" />
        </button>
        {scrolled && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 bg-white text-gray-700 border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronUp size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

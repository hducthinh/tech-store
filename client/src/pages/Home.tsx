import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Star, Zap, ShieldCheck, Truck, ShoppingCart, RefreshCw, X, Box, Eye, Heart, Flame } from "lucide-react";
import { fmt, img, Btn, Card } from "../components/SharedUI";
import { Skeleton } from "../components/ui/Skeleton";
import { ProductSkeleton } from "../components/ui/ProductSkeleton";
import UserLayout from "../components/layouts/UserLayout";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useCart } from "../contexts/CartContext";
import { useAlert } from "../contexts/AlertContext";
import api from "../services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const BANNER_SLIDES = [
  { src: "/banners/1.png", alt: "Khuyến mãi 1" },
  { src: "/banners/2.png", alt: "Khuyến mãi 2" },
  { src: "/banners/3.png", alt: "Khuyến mãi 3" },
  { src: "/banners/4.png", alt: "Khuyến mãi 4" },
  { src: "/banners/5.png", alt: "Khuyến mãi 5" },
  { src: "/banners/6.png", alt: "Khuyến mãi 6" },
  { src: "/banners/7.png", alt: "Khuyến mãi 7" },
  { src: "/banners/8.png", alt: "Khuyến mãi 8" }
];

const UTILITIES = [
  { icon: <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><ShieldCheck size={24} className="text-blue-600" /></div>, title: "Thương hiệu đảm bảo", desc: "Nhập khẩu, bảo hành chính hãng" },
  { icon: <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><RefreshCw size={24} className="text-blue-600" /></div>, title: "Đổi trả dễ dàng", desc: "Theo chính sách đổi trả tại DucThinh TechShop" },
  { icon: <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><Truck size={24} className="text-blue-600" /></div>, title: "Giao hàng tận nơi", desc: "Trên toàn quốc" },
  { icon: <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><ShieldCheck size={24} className="text-blue-600" /></div>, title: "Sản phẩm chất lượng", desc: "Đảm bảo tương thích và độ bền cao" }
];

function getCategoryIcon(name) {
  if (!name) return <Box size={40} strokeWidth={1.5} className="text-blue-600 mb-4 group-hover:scale-110 transition-transform mx-auto" />;
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
    return <img src={`/icons/${iconName}`} alt={name} className="w-10 h-10 object-contain mb-4 group-hover:scale-110 transition-transform mx-auto filter-none" />;
  }
  return <Box size={40} strokeWidth={1.5} className="text-blue-600 mb-4 group-hover:scale-110 transition-transform mx-auto" />;
}

function HomeContent() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useAlert();

  const [heroBannerData, setHeroBannerData] = useState(null);

  const calculateTimeLeft = () => {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const difference = endOfDay.getTime() - now.getTime();

    if (difference > 0) {
      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, heroRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products?sortBy=soldCount_desc&limit=8"),
          api.get("/products", { params: { categoryNames: "Laptop,Màn hình,VGA", limit: 50 } })
        ]);

        setCategories(catRes.data?.data?.categories || []);
        setProducts(prodRes.data?.data?.products || []);

        const heroProducts = heroRes.data?.data?.products || [];
        if (heroProducts.length > 0) {
          const epoch6Hours = Math.floor(Date.now() / (6 * 60 * 60 * 1000));
          const randomIndex = epoch6Hours % heroProducts.length;
          const selectedHero = heroProducts[randomIndex];

          setHeroBannerData({
            productSlug: selectedHero.slug || selectedHero._id,
            badge: "🔥 Sản phẩm nổi bật",
            titleLine1: selectedHero.name.split(" ").slice(0, 5).join(" ") + (selectedHero.name.split(" ").length > 5 ? "..." : ""),
            titleLine2: "Giảm sốc",
            titleLine2Suffix: "hôm nay",
            desc: selectedHero.shortDescription || `Trải nghiệm cấu hình vượt trội với ${selectedHero.name}. Bảo hành chính hãng trên toàn quốc.`,
            image: selectedHero.images?.[0] || selectedHero.thumbnail || img("1517336714731-489689fd1ca8", 800, 600)
          });
        } else {
          setHeroBannerData({
            badge: "🔥 Siêu Sale",
            titleLine1: "Đón hè sang",
            titleLine2: "Giảm tới 50%",
            titleLine2Suffix: "hôm nay",
            desc: "Nhanh tay sắm ngay các thiết bị công nghệ với mức giá ưu đãi chưa từng có.",
            image: img("1517336714731-489689fd1ca8", 800, 600)
          });
        }
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
      {/* Promo Slider */}
      <section className="pt-10 md:pt-14 pb-2 w-full bg-transparent border-b border-gray-200">
        <div className="relative max-w-7xl mx-auto px-4">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={16}
            slidesPerView={1.2}
            breakpoints={{
              768: {
                slidesPerView: 2,
              }
            }}
            loop={true}
            speed={700}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            className="w-full pb-2 pt-2"
          >
            {BANNER_SLIDES.map((banner, i) => (
              <SwiperSlide key={i}>
                <div onClick={() => setSelectedImage(banner.src)} className="w-full rounded-xl bg-white shadow-sm overflow-hidden aspect-[2/1] relative cursor-pointer border border-gray-100 group">
                  <img src={banner.src} alt={banner.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Hero Section */}
      <section className="mt-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-900 text-white py-8 px-6 md:px-10 shadow-lg rounded-2xl md:rounded-3xl border border-blue-800 mx-auto min-h-[300px] flex items-center">
            {!heroBannerData ? (
              <div className="animate-pulse flex flex-col md:flex-row items-center gap-6 w-full">
                <div className="flex-1 space-y-4 w-full">
                  <div className="h-6 bg-white/10 rounded-full w-32"></div>
                  <div className="h-10 bg-white/10 rounded-lg w-3/4"></div>
                  <div className="h-10 bg-white/10 rounded-lg w-1/2"></div>
                  <div className="h-16 bg-white/10 rounded-lg w-full"></div>
                  <div className="flex gap-3 pt-2">
                    <div className="h-10 w-32 bg-white/10 rounded-lg"></div>
                    <div className="h-10 w-32 bg-white/10 rounded-lg"></div>
                  </div>
                </div>
                <div className="flex-1 w-full relative">
                  <div className="bg-white/5 rounded-2xl aspect-[16/9] md:aspect-[2/1] lg:aspect-[16/9]"></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                {/* Left Content */}
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-300 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                    {heroBannerData.badge}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black leading-tight">
                    {heroBannerData.titleLine1}<br />
                    <span className="text-yellow-400">{heroBannerData.titleLine2}</span> {heroBannerData.titleLine2Suffix}
                  </h1>
                  <p className="text-blue-200 text-base max-w-md">
                    {heroBannerData.desc}
                  </p>
                  <div className="flex gap-3 pt-2">
                    <Btn variant="primary" onClick={() => heroBannerData.productSlug ? navigate(`/products/${heroBannerData.productSlug}`) : null} className="px-6 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/50 border-none flex items-center gap-2 transition-all">Xem ngay <ArrowRight size={16} /></Btn>
                  </div>

                  <div className="flex gap-6 pt-4">
                    <div>
                      <div className="font-bold text-lg">12 tháng</div>
                      <div className="text-blue-300 text-xs">Bảo hành</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">24/7</div>
                      <div className="text-blue-300 text-xs">Hỗ trợ</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">Miễn phí</div>
                      <div className="text-blue-300 text-xs">Giao hàng</div>
                    </div>
                  </div>
                </div>

                {/* Right Image */}
                <div className="flex-1 w-full relative">
                  <div className="bg-white/10 rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[2/1] lg:aspect-[16/9] relative flex items-center justify-center p-4 shadow-2xl border border-white/10">
                    <img src={heroBannerData.image} alt={heroBannerData.titleLine1} className="w-full h-full object-cover rounded-xl drop-shadow-xl hover:scale-105 transition-transform duration-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      <section className="relative z-10 mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 py-8 px-4 md:px-8 shadow-lg rounded-2xl md:rounded-3xl border border-red-400 mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-white uppercase italic">FLASH SALE - GIỜ VÀNG GIÁ SỐC</h2>
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow flex items-center border border-red-400">
                    HOT! <Zap size={12} className="ml-1" />
                  </span>
                </div>
                <div className="text-white text-sm font-semibold mt-1 flex gap-4 hidden sm:flex">
                  <span>Độc quyền DucThinh TechShop</span>
                  <span>giảm giá lên đến 59%</span>
                  <span>Cam kết giá tốt nhất</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 md:mt-0 bg-black/10 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">Kết thúc sau</span>
                <div className="flex gap-2 text-center">
                  <div className="bg-black text-white rounded-lg px-2 py-1 min-w-[40px]">
                    <div className="text-lg font-bold leading-none">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-[10px] text-gray-400">Giờ</div>
                  </div>
                  <div className="text-black font-bold self-center">:</div>
                  <div className="bg-black text-white rounded-lg px-2 py-1 min-w-[40px]">
                    <div className="text-lg font-bold leading-none">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-[10px] text-gray-400">Phút</div>
                  </div>
                  <div className="text-black font-bold self-center">:</div>
                  <div className="bg-black text-white rounded-lg px-2 py-1 min-w-[40px]">
                    <div className="text-lg font-bold leading-none">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-[10px] text-gray-400">Giây</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-6">
              {loading ? (
                Array(5).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              ) : (
                products.slice(0, 5).map((p, idx) => (
                  <Card key={p._id || idx} className="bg-white rounded-lg p-4 flex flex-col h-full relative cursor-pointer hover:-translate-y-1.5 transition-all duration-300 border border-transparent hover:border-red-500 group hover:shadow-xl overflow-hidden" onClick={() => navigate(`/products/${p.slug || p._id}`)}>
                    {/* Product Image */}
                    <div className="relative mb-4 h-44 bg-white flex items-center justify-center p-2 overflow-hidden">
                      <img src={p.images?.[0] || p.thumbnail || img("1517336714731-489689fd1ca8")} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />

                      <div className="absolute top-2 right-2 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-red-50 shadow-md border border-gray-100" onClick={(e) => e.stopPropagation()}>
                          <Heart size={14} />
                        </button>
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 shadow-md border border-gray-100" onClick={(e) => e.stopPropagation()}>
                          <Eye size={14} />
                        </button>
                      </div>

                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
                            -{Math.round((1 - p.price / p.originalPrice) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col relative z-10">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] mb-3 group-hover:text-blue-600">{p.name}</h3>
                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-red-500 text-lg">{fmt(p.price)}</span>
                        </div>
                        {p.originalPrice && p.originalPrice > p.price ? (
                          <div className="flex items-center gap-2 mb-4 min-h-[20px]">
                            <span className="text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-4 min-h-[20px]">
                          </div>
                        )}

                        {/* Sold Progress */}
                        <div className="relative w-full h-[18px] bg-[#ffecd8] rounded-full overflow-hidden mt-1 flex items-center justify-center shadow-inner">
                          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff5722] to-[#ff9800]" style={{ width: `${Math.min(100, Math.max(0, ((p.soldCount || 0) / 300) * 100))}%` }}></div>
                          <span className="relative z-10 text-[10px] text-white font-bold drop-shadow-md flex items-center gap-1">
                            <span className="text-yellow-200">🔥</span> Đã bán {p.soldCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Add to cart button */}
                    <button
                      className="absolute bottom-[44px] right-4 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-transform shadow-md hover:scale-110 z-20"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const success = await addToCart(p._id, 1);
                        if (success) showToast(`Đã thêm ${p.name} vào giỏ hàng`, "success");
                      }}
                    >
                      <ShoppingCart size={12} />
                    </button>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </section>



      {/* Categories */}
      <section className="py-8 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black mb-2">Danh mục nổi bật</h2>
                <p className="text-gray-500">Tìm kiếm sản phẩm theo danh mục</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 p-6 rounded-xl flex flex-col items-center justify-center">
                    <Skeleton className="w-12 h-12 rounded-full mb-4" />
                    <Skeleton className="w-20 h-5 mb-2" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                ))
              ) : (
                categories
                  .filter(c => ["VGA", "CPU", "Mainboard", "RAM", "Ổ cứng SSD", "Màn hình", "Bàn phím", "Chuột"].includes(c.name))
                  .concat(categories.filter(c => !["VGA", "CPU", "Mainboard", "RAM", "Ổ cứng SSD", "Màn hình", "Bàn phím", "Chuột"].includes(c.name)))
                  .slice(0, 6)
                  .map(c => (
                    <Card
                      key={c._id}
                      onClick={() => navigate(`/collections/${c.slug}`)}
                      className={`bg-gray-50 border border-gray-100 p-6 text-center hover:shadow-md transition-shadow cursor-pointer hover:border-blue-200 group`}
                    >
                      <div className="flex items-center justify-center">
                        {getCategoryIcon(c.name)}
                      </div>
                      <h3 className={`font-bold transition-colors text-gray-900 group-hover:text-blue-600`}>{c.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{c.products || 0} sản phẩm</p>
                    </Card>
                  ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Top Products */}
      <section className="py-8 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
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
              {loading ? (
                Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</div>
              ) : (
                products.map(p => (
                  <Link key={p._id} to={`/products/${p.slug || p._id}`} className="block h-full">
                    <Card className="overflow-hidden group cursor-pointer flex flex-col h-full w-full bg-white hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100">
                      <div className="relative h-64 bg-gray-100 overflow-hidden">
                        <img src={p.images?.[0] || p.thumbnail || img("1610945415295-d9bbf067e59c")} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 flex flex-row items-center gap-2">
                          <span className="text-red-500 text-[12px] font-black px-1 py-1 flex items-center gap-1 w-max drop-shadow-sm uppercase tracking-wider"><Flame size={16} className="fill-red-500 text-red-500 animate-pulse" /> HOT</span>
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
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="text-xs text-gray-500 mb-2">{p.brandName || p.brand}</div>
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">{p.name}</h3>
                        <div className="flex items-center gap-1 mb-4">
                          <Star size={14} className="fill-amber-500 text-amber-500" />
                          <span className="text-sm font-semibold">{p.rating || 5}</span>
                          <span className="text-xs text-gray-400">({p.soldCount || 0} đã bán)</span>
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="font-black text-red-500 text-lg">{fmt(p.price)}</div>
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
                )))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Carousel */}
      <section className="py-8 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-center mb-8 text-gray-800">ĐỐI TÁC CHIẾN LƯỢC</h2>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-80 hover:opacity-100 transition-opacity duration-500">
              <img src="/logos/intel.svg" alt="Intel" className="h-10 object-contain hover:scale-110 transition-transform duration-300" />
              <img src="/logos/amd.svg" alt="AMD" className="h-8 object-contain hover:scale-110 transition-transform duration-300" />
              <img src="/logos/nvidia.svg" alt="NVIDIA" className="h-8 object-contain hover:scale-110 transition-transform duration-300" />
              <img src="/logos/asus.svg" alt="ASUS" className="h-6 object-contain hover:scale-110 transition-transform duration-300" />
              <img src="/logos/msi.svg" alt="MSI" className="h-6 object-contain hover:scale-110 transition-transform duration-300" />
              <img src="/logos/gigabyte.svg" alt="Gigabyte" className="h-6 object-contain hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-12 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2 text-gray-900">Khách hàng nói gì về chúng tôi</h2>
            <p className="text-gray-500">Hàng ngàn khách hàng đã tin tưởng và lựa chọn TechStore</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform flex flex-col h-full">
              <div className="flex text-amber-500 mb-3"><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /></div>
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">"Sản phẩm chất lượng, giao hàng cực kỳ nhanh chóng. Mình đặt buổi sáng mà chiều đã nhận được ở nội thành."</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">NA</div>
                <div><p className="font-bold text-sm text-gray-900">Nguyễn Văn An</p><p className="text-xs text-gray-500">Đã mua Laptop Asus</p></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform flex flex-col h-full">
              <div className="flex text-amber-500 mb-3"><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /></div>
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">"Build PC ở đây đi dây rất gọn gàng. Nhân viên tư vấn nhiệt tình, không chèo kéo cấu hình thừa."</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">TB</div>
                <div><p className="font-bold text-sm text-gray-900">Trần Bảo</p><p className="text-xs text-gray-500">Đã mua PC Gaming</p></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform flex flex-col h-full">
              <div className="flex text-amber-500 mb-3"><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /><Star size={16} className="fill-amber-500" /></div>
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">"Giá luôn tốt nhất thị trường, bảo hành chính hãng yên tâm. Đã ủng hộ shop chiếc VGA thứ 3."</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">LH</div>
                <div><p className="font-bold text-sm text-gray-900">Lê Hoàng</p><p className="text-xs text-gray-500">Đã mua VGA RTX 4070</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white pt-10 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {UTILITIES.map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3 cursor-default">
                <div className="flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-[15px] text-gray-900 mb-1">{f.title}</h4>
                  <p className="text-[13px] text-gray-600 max-w-[220px] leading-relaxed mx-auto">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-screen flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              className="absolute -top-12 right-0 md:-right-12 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>
            <img src={selectedImage} alt="Enlarged view" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home({ children }: any = {}) {
  useDocumentMeta(
    "Trang chủ - DucThinh TechShop",
    "Hệ thống phân phối thiết bị máy chủ, workstation và linh kiện cao cấp dành riêng cho Data Engineer, Developer."
  );

  return (
    <UserLayout>
      {children || <HomeContent />}
    </UserLayout>
  );
}

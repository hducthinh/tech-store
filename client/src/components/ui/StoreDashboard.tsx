import React, { useState, useEffect } from "react";
import { 
  Terminal, Search, ShoppingCart, User, LogOut, Cpu, Laptop, 
  Tv, Database, HelpCircle, Sparkles, MessageSquare, History, 
  Trash2, Plus, Minus, CreditCard, CheckCircle2, ChevronRight, 
  ArrowLeft, Info, Send, Loader2, ArrowRight
} from "lucide-react";
import { Product, CartItem, Order, Message } from "../types";
import api from "../../services/api";

interface StoreDashboardProps {
  userEmail: string;
  onLogout: () => void;
  onLoginClick?: () => void;
}

export default function StoreDashboard({ userEmail, onLogout, onLoginClick }: StoreDashboardProps) {
  // State for Catalog
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categoriesDb, setCategoriesDb] = useState<{_id: string, name: string}[]>([]);

  // State for Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // State for Checkout Flow
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Info, 2: Payment, 3: Completed
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [promotionCode, setPromotionCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  // State for AI Chatbot (Gemini)
  const [activeTab, setActiveTab] = useState<"catalog" | "ai" | "history">("catalog");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Xin chào! Tôi là **Trợ lý AI tư vấn phần cứng** của TechStore. 💻\n\nTôi có thể giúp bạn lựa chọn cấu hình máy trạm AI, máy tính lập trình, tư vấn hiệu năng hoặc phân tích sự phù hợp của thiết bị trong cửa hàng với nhu cầu của bạn.\n\nHãy nhấn vào các gợi ý bên dưới hoặc hỏi tôi bất cứ điều gì!`,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [userInputMessage, setUserInputMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // State for Orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch categories on startup
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/categories");
        const json = await res.json();
        if (json.data && json.data.categories) {
          setCategoriesDb(json.data.categories);
        }
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoadingProducts(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set("search", searchQuery);
        if (selectedCategory !== "All") queryParams.set("categoryId", selectedCategory);
        
        const res = await fetch(`http://localhost:5000/api/v1/products?${queryParams.toString()}`);
        const json = await res.json();
        if (json.data && json.data.products) {
          const normalized = json.data.products.map((p: any) => ({
            id: p._id,
            name: p.name,
            price: p.price,
            category: p.categoryId?.name || p.categoryName || "Components",
            specs: Object.entries(p.specs || {}).map(([k, v]) => `${k}: ${v}`).join(", ") || p.shortDescription || "",
            description: p.description || p.shortDescription || "",
            inStock: p.stock > 0,
          }));
          setProducts(normalized);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách sản phẩm:", err);
      } finally {
        setLoadingProducts(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Load existing orders & cart on startup
  useEffect(() => {
    const savedOrders = localStorage.getItem(`orders_${userEmail}`);
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    
    if (userEmail) {
      api.get("/cart")
        .then(res => {
          const items = res.data.data.cart.items.map((item: any) => ({
            product: { ...item.productId, id: item.productId._id },
            quantity: item.quantity
          }));
          setCart(items);
        })
        .catch(err => console.error("Lỗi tải giỏ hàng:", err));
    } else {
      setCart([]);
    }
  }, [userEmail]);

  // Products are filtered on the backend now.

  // Cart operations
  const addToCart = async (product: Product) => {
    if (!userEmail) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      if (onLoginClick) {
        onLoginClick();
      }
      return;
    }

    try {
      const res = await api.post("/cart", { productId: product.id, quantity: 1 });
      const items = res.data.data.cart.items.map((item: any) => ({
        product: { ...item.productId, id: item.productId._id },
        quantity: item.quantity
      }));
      setCart(items);
      
      // Show quick mini confirmation alert
      const toast = document.createElement("div");
      toast.className = "fixed bottom-5 right-5 bg-[#0058be] text-white py-3 px-5 rounded-lg text-xs font-semibold shadow-2xl z-50 transition-all duration-300 animate-slide-in";
      toast.innerHTML = ` đã thêm <strong>${product.name}</strong> vào giỏ hàng thành công!`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("opacity-0");
        setTimeout(() => toast.remove(), 400);
      }, 2500);
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng");
    }
  };

  const updateCartQuantity = async (productId: string, delta: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;
    
    const newQty = item.quantity + delta;
    if (newQty < 1) return; // Nếu < 1 thì không update, người dùng dùng nút thùng rác để xóa

    // Optimistic UI update
    setCart(cart.map(i => i.product.id === productId ? { ...i, quantity: newQty } : i));

    try {
      await api.patch("/cart/update-quantity", { productId, quantity: newQty });
    } catch (error: any) {
      console.error("Lỗi update số lượng:", error);
      // Revert if error
      setCart(cart.map(i => i.product.id === productId ? { ...i, quantity: item.quantity } : i));
      alert(error.response?.data?.message || "Lỗi cập nhật số lượng");
    }
  };

  const removeFromCart = async (productId: string) => {
    const backupCart = [...cart];
    setCart(cart.filter(item => item.product.id !== productId));
    
    try {
      await api.delete(`/cart/${productId}`);
    } catch (error: any) {
      console.error("Lỗi xóa khỏi giỏ:", error);
      setCart(backupCart);
      alert(error.response?.data?.message || "Lỗi khi xóa khỏi giỏ hàng");
    }
  };

  const getSubtotal = () => {
    return cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);
  };

  const getDiscountAmount = () => {
    return (getSubtotal() * discountPercent) / 100;
  };

  const getTotal = () => {
    return getSubtotal() - getDiscountAmount();
  };

  const applyPromo = () => {
    setPromoError("");
    setPromoSuccess("");
    const code = promotionCode.toUpperCase().trim();
    if (code === "TECHSTARTUP" || code === "AI2026") {
      setDiscountPercent(15);
      setPromoSuccess("Áp dụng mã giảm giá 15% thành công!");
    } else if (code === "CODECHAMP") {
      setDiscountPercent(10);
      setPromoSuccess("Áp dụng mã giảm giá 10% thành công!");
    } else {
      setPromoError("Mã giảm giá không chính xác hoặc đã hết hạn.");
    }
  };

  const handlePlaceOrder = () => {
    if (!shippingName || !shippingPhone || !shippingAddress) {
      alert("Vui lòng điền đầy đủ thông tin giao nhận.");
      return;
    }

    const newOrder: Order = {
      id: "TS-" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString("vi-VN") + " " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      items: [...cart],
      total: getTotal(),
      fullName: shippingName,
      address: shippingAddress,
      phone: shippingPhone,
      paymentMethod: paymentMethod,
      status: "Chờ xử lý"
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(`orders_${userEmail}`, JSON.stringify(updatedOrders));

    // Reset checkout & cart
    setCart([]);
    setCheckoutStep(3);
  };

  // Chat with Gemini API
  const handleSendMessage = async (text: string) => {
    const msg = text || userInputMessage;
    if (!msg.trim()) return;

    setUserInputMessage("");
    
    const userMsg: Message = {
      role: "user",
      content: msg,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setAiLoading(true);

    try {
      // Prepare previous conversational context to send to API
      // Keep only latest 10 messages for token usage and precision
      const conversationalHistory = chatMessages.slice(-10);

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: conversationalHistory
        })
      });

      const data = await res.json();
      
      const aiReply: Message = {
        role: "assistant",
        content: data.reply || "Tôi gặp trục trặc kỹ thuật khi kết nối hệ thống. Bạn có thể hỏi lại sau.",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };

      setChatMessages(prev => [...prev, aiReply]);

    } catch (err: any) {
      console.error("Gemini Chat Endpoint Fail:", err);
      const errReply: Message = {
        role: "assistant",
        content: `Tôi phát hiện lỗi hệ thống kết nối AI (${err.message}). Bạn vui lòng thực hiện kiểm tra GEMINI_API_KEY ở cài đặt.`,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages(prev => [...prev, errReply]);
    } finally {
      setAiLoading(false);
    }
  };

  // Quick suggestion questions
  const chatSuggestions = [
    "Cần cấu hình thiết bị khoảng 50 triệu học AI Deep Learning?",
    "MacBook Pro M3 Max gõ code có êm bằng Keychron Q1 Max không?",
    "Văn phòng Dev cần màn hình LG UltraFine dùng cổng C sạc nhanh không?",
    "Các cấu hình workstation khuyên dùng từ TechStore?"
  ];

  // Helper formatting currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Helper category icons mapping
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case "Workstation":
        return <Database className="w-5 h-5 text-indigo-600" />;
      case "Laptop":
        return <Laptop className="w-5 h-5 text-blue-600" />;
      case "Monitors":
        return <Tv className="w-5 h-5 text-emerald-600" />;
      case "Components":
        return <Cpu className="w-5 h-5 text-orange-600" />;
      default:
        return <Terminal className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div id="store-workspace" className="min-h-screen bg-[#faf8ff] text-[#1a1b21] font-sans flex flex-col">
      
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 bg-white border-b border-[#c5c5d3] z-40 px-4 py-3 md:px-8 shadow-sm">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand left side */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("catalog")}>
              <div className="p-2 bg-[#00236f] text-white rounded-lg">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#00236f] font-sans">TechStore</h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Professional Hardware</p>
              </div>
            </div>

            {/* Quick Mobile trigger selectors */}
            <div className="flex md:hidden items-center gap-2">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[#ba1a1a] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>



          {/* Navigation right controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            
            {/* View tabs selectors */}
            <nav className="flex bg-[#eeedf4]/60 p-1 rounded-lg">
              <button 
                onClick={() => { setActiveTab("catalog"); setIsCheckoutOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === "catalog" ? "bg-white text-[#00236f] shadow-sm" : "text-[#444651] hover:text-[#00236f]"}`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Sản phẩm
              </button>
              <button 
                onClick={() => { setActiveTab("ai"); setIsCheckoutOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === "ai" ? "bg-white text-[#00236f] shadow-sm" : "text-[#444651] hover:text-[#00236f]"}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                Trợ lý AI Copilot
              </button>
              <button 
                onClick={() => { setActiveTab("history"); setIsCheckoutOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === "history" ? "bg-white text-[#00236f] shadow-sm" : "text-[#444651] hover:text-[#00236f]"}`}
              >
                <History className="w-3.5 h-3.5" />
                Đơn mua ({orders.length})
              </button>
            </nav>

            {/* Desktop Cart activator */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex relative items-center gap-2 px-3 py-2 border border-slate-200 hover:bg-[#eeedf4]/40 rounded-lg text-slate-700 transition cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-[#0058be]" />
              <span className="text-xs font-semibold text-slate-700">Giỏ hàng</span>
              <span className="bg-[#0058be] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            </button>

            {/* Current user & Logout */}
            {userEmail ? (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <div className="w-8 h-8 rounded-full bg-[#2170e4]/10 text-[#0058be] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-mono text-slate-400">Khách hàng</p>
                  <p className="font-semibold text-slate-800 max-w-[120px] truncate">{userEmail}</p>
                </div>
                <button 
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="p-2 text-slate-400 hover:text-[#ba1a1a] hover:bg-red-50 rounded-lg transition duration-250 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <button
                  onClick={onLoginClick}
                  className="text-xs font-semibold px-4 py-2 bg-[#0058be] text-white rounded-lg hover:bg-[#00236f] transition cursor-pointer"
                >
                  Đăng nhập
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* 2. Main content pages handler */}
      <section className="flex-grow max-w-[1280px] w-full mx-auto p-4 md:p-8 flex flex-col min-h-0">
        
        {/* TAB 1: Product Catalog Card Grid */}
        {activeTab === "catalog" && !isCheckoutOpen && (
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Promo announcement banner */}
            <div className="p-4 md:p-6 bg-gradient-to-r from-[#00236f] to-[#0058be] rounded-2xl text-white flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden shadow-md">
              <div className="relative z-10 max-w-xl text-center md:text-left">
                <span className="bg-amber-400 text-slate-900 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Mã Ưu Đãi Hè 2026</span>
                <h3 className="text-xl md:text-2xl font-bold mt-2">Dựng Phòng Lập Trình & Hệ Thống AI</h3>
                <p className="text-xs text-white/85 mt-1">Sử dụng mã coupon <strong className="text-amber-300 font-mono">TECHSTARTUP</strong> hoặc <strong className="text-amber-300 font-mono">AI2026</strong> khi thanh toán để nhận ngay chiết khấu 15% tất cả linh kiện / máy trạm cao cấp.</p>
              </div>
              <button 
                onClick={() => setActiveTab("ai")}
                className="relative z-10 bg-white text-[#00236f] hover:bg-amber-400 hover:text-slate-900 transition font-semibold text-xs px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                Tư vấn cấu hình máy trạm AI miễn phí
                <ArrowRight className="w-4 h-4" />
              </button>
              
              {/* Background abstract overlay element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-12 -translate-y-12"></div>
            </div>

            {/* Controls: Search and Filters */}
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
              {/* Category Filter Pills on Top */}
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none w-full xl:w-auto">
                {[{_id: "All", name: "Tất cả sản phẩm"}, ...categoriesDb].map(c => (
                  <button
                    key={c._id}
                    onClick={() => setSelectedCategory(c._id)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full border transition cursor-pointer whitespace-nowrap ${selectedCategory === c._id ? "bg-[#00236f] border-[#00236f] text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Catalog search bar */}
              <div className="relative w-full xl:w-[400px] shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Tìm kiếm máy trạm, chip xử lý, bàn phím..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-[#ba1a1a] transition-colors cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>

            {/* Catalog content section */}
            {loadingProducts ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-[#0058be] animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Đang hiệu chuẩn phần cứng TechStore...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex-1 text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-lg font-bold text-slate-700">Không tìm thấy sản phẩm phù hợp</p>
                <p className="text-sm text-slate-400 mt-1">Thử nhập từ khóa khác hoặc trò chuyện với Trợ lý AI để yêu cầu nhập hàng.</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200"
                >
                  Thiết lập lại tìm kiếm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(p => (
                  <div 
                    key={p.id} 
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Header product tag */}
                    <div className="p-5 flex-grow flex flex-col">
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                          {renderCategoryIcon(p.category)}
                          {p.category}
                        </span>
                        {p.inStock ? (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Còn hàng</span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">Liên hệ đặt</span>
                        )}
                      </div>

                      <h4 
                        onClick={() => setSelectedProduct(p)}
                        className="text-base font-bold text-slate-800 line-clamp-2 hover:text-[#0058be] transition cursor-pointer leading-tight mb-2"
                      >
                        {p.name}
                      </h4>
                      
                      <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2.5 rounded border border-slate-100/50 line-clamp-3 mb-3">
                        {p.specs}
                      </p>

                      <p className="text-xs text-slate-400 line-clamp-2 mt-auto">
                        {p.description}
                      </p>
                    </div>

                    {/* Pricing footer block */}
                    <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-400 font-medium">Giá sản phẩm</span>
                        <span className="text-base font-display font-extrabold text-[#ba1a1a]">{formatVND(p.price)}</span>
                      </div>
                      
                      <button
                        onClick={() => p.inStock ? addToCart(p) : setActiveTab("ai")}
                        className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer ${p.inStock ? "bg-[#0058be] hover:bg-[#00236f] text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                      >
                        {p.inStock ? (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Thêm vào giỏ
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                            Nhờ AI đặt chế tạo
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI Tech Assistant Workspace (Gemini Integration) */}
        {activeTab === "ai" && !isCheckoutOpen && (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row min-h-[500px] overflow-hidden">
            
            {/* Sidebar information panel: available store context */}
            <div className="w-full md:w-[320px] bg-slate-50 border-r border-slate-200 p-5 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#00236f]">
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300" />
                  <h3 className="font-bold text-sm tracking-tight">TechStore Copilot</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Nhận tư vấn cấu hình PC đồ học, máy trạm AI hoặc kiểm tra sự tương thích linh kiện trực tiếp từ Trí tuệ Nhân tạo Gemini 3.5.
                </p>
                <div className="border-t border-slate-200 pt-3 space-y-2">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Thông tin Cửa hàng nạp vào AI:</p>
                  <p className="text-[11px] font-medium text-slate-700 bg-white p-2 rounded border border-slate-200">
                    💡 <strong>Smart Memory:</strong> AI đang ghi nhớ 8 dòng sản phẩm tối tân của TechStore và giá chiết khấu 15% hè 2026.
                  </p>
                </div>
              </div>

              {/* Information disclaimer info note */}
              <div className="p-3 bg-blue-50/60 rounded-lg flex gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-800 leading-normal">
                  Chương trình chạy bảo mật thông qua máy chủ cục bộ Cloud Run, dữ liệu của bạn được ẩn danh hoàn toàn.
                </p>
              </div>
            </div>

            {/* Conversation Window */}
            <div className="flex-1 flex flex-col justify-between h-[550px] bg-white">
              
              {/* Header inside chat */}
              <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p className="text-xs font-semibold text-slate-700">Trợ lý AI thời gian thực</p>
                </div>
                <button 
                  onClick={() => setChatMessages([{
                    role: "assistant",
                    content: `Chào bạn quay lại! Hãy hỏi tôi bất cứ cấu hình phần cứng chuyên nghiệp nào của TechStore.`,
                    timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                  }])}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Xóa lịch sử chat
                </button>
              </div>

              {/* Chat screen logs wrapper */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                    
                    {/* Role circle avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${msg.role === "user" ? "bg-[#00236f] text-white" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"}`}>
                      {msg.role === "user" ? "Khách" : <Sparkles className="w-4 h-4" />}
                    </div>

                    {/* Chat Bubble card */}
                    <div className={`p-4 rounded-2xl ${msg.role === "user" ? "bg-[#0058be] text-white rounded-tr-none" : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none font-sans"}`}>
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {msg.content}
                      </p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`text-[9px] block ${msg.role === "user" ? "text-white/60" : "text-slate-400"}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}

                {aiLoading && (
                  <div className="flex gap-4 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested template questions buttons */}
              <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex gap-2 overflow-x-auto select-none">
                {chatSuggestions.map((s, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSendMessage(s)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#0058be] text-slate-600 hover:text-[#0058be] text-[11px] font-semibold rounded-lg shadow-sm transition whitespace-nowrap cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Form Input field for sending custom questions */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(""); }}
                className="p-4 border-t border-slate-200 bg-white flex gap-2 items-center"
              >
                <input 
                  type="text"
                  placeholder="Hỏi AI cấu hình máy trạm tối ưu..."
                  value={userInputMessage}
                  onChange={(e) => setUserInputMessage(e.target.value)}
                  disabled={aiLoading}
                  className="flex-1 py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={aiLoading || !userInputMessage.trim()}
                  className="p-3.5 bg-[#0058be] text-white hover:bg-[#00236f] disabled:opacity-30 rounded-xl transition cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>
        )}

        {/* TAB 3: Simulated placed orders history with states */}
        {activeTab === "history" && !isCheckoutOpen && (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Lịch sử giao dịch</h3>
                <p className="text-xs text-slate-400">Xem lại các đơn hàng phần cứng chuyên dụng đã đặt của {userEmail}</p>
              </div>
              <span className="px-3 py-1 bg-[#eeedf4] border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg font-mono">
                Số đơn đặt: {orders.length}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
                <History className="w-12 h-12 text-slate-200" />
                <p className="text-base font-bold text-slate-700">Chưa có giao dịch nào được ghi nhận</p>
                <p className="text-xs text-slate-400">Hãy thêm một vài linh kiện tối tân vào giỏ hàng và thực hiện thanh toán mẫu.</p>
                <button 
                  onClick={() => setActiveTab("catalog")}
                  className="mt-2 px-5 py-2 bg-[#0058be] text-white text-xs font-semibold rounded-lg hover:bg-[#00236f]"
                >
                  Khám phá cửa hàng ngay
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((ord) => (
                  <div key={ord.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Header đơn */}
                    <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <p className="text-xs text-slate-400 font-mono">Mã đơn hàng</p>
                        <p className="text-sm font-bold text-[#00236f] font-mono">{ord.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 text-left sm:text-right">Ngày đặt</p>
                        <p className="text-xs text-slate-700 font-medium">{ord.date}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs text-slate-400">Trạng thái</p>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Danh sách các item trong đơn hàng */}
                    <div className="p-4 space-y-4 division-y division-slate-100">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="max-w-md">
                            <p className="font-bold text-slate-800">{item.product.name}</p>
                            <p className="text-[11px] text-slate-400 max-w-sm font-mono truncate">{item.product.specs}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-400">{item.quantity} x </span>
                            <span className="font-semibold text-slate-700">{formatVND(item.product.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer tổng đơn */}
                    <div className="bg-slate-50/50 p-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="text-xs text-slate-500 max-w-md">
                        <p>📍 Giao nhận: <strong>{ord.fullName}</strong> ({ord.phone})</p>
                        <p className="truncate">🏢 Địa chỉ: {ord.address}</p>
                        <p>💳 Cổng thanh toán: {ord.paymentMethod === "Bank Transfer" ? "Chuyển khoản ATM Smart Banking" : ord.paymentMethod === "COD" ? "Thanh toán lúc nhận hàng COD" : "Cổng thẻ quốc tế Visa/MasterCard"}</p>
                      </div>
                      <div className="text-right w-full md:w-auto">
                        <p className="text-xs text-slate-400">Tổng thanh toán</p>
                        <p className="text-lg font-display font-extrabold text-[#ba1a1a]">{formatVND(ord.total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. STEP BY STEP CHECKOUT MODULE VIEW */}
        {isCheckoutOpen && (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm max-w-4xl mx-auto w-full">
            
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <button 
                onClick={() => {
                  if (checkoutStep === 1) {
                    setIsCheckoutOpen(false);
                  } else if (checkoutStep === 2) {
                    setCheckoutStep(1);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0058be] transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>

              <div id="checkout-steps" className="flex items-center gap-4">
                <span className={`text-xs font-extrabold flex items-center gap-1 ${checkoutStep >= 1 ? "text-[#0058be]" : "text-slate-300"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep >= 1 ? "bg-[#0058be] text-white" : "bg-slate-100 text-slate-400"}`}>1</span>
                  Giao nhận
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className={`text-xs font-extrabold flex items-center gap-1  ${checkoutStep >= 2 ? "text-[#0058be]" : "text-slate-300"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep >= 2 ? "bg-[#0058be] text-white" : "bg-slate-100 text-slate-400"}`}>2</span>
                  Thanh toán
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className={`text-xs font-extrabold flex items-center gap-1 ${checkoutStep >= 3 ? "text-[#0058be]" : "text-slate-300"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep >= 3 ? "bg-[#0058be] text-white" : "bg-slate-100 text-slate-400"}`}>3</span>
                  Hoàn tất
                </span>
              </div>
            </div>

            {/* CHECKOUT STEP 1: Details and billing information form */}
            {checkoutStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Information form */}
                <div className="space-y-4">
                  <h3 className="font-bold text-base text-[#1a1b21] mb-2 border-l-4 border-[#0058be] pl-2">Thông tin địa chỉ giao nhận</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#444651]">Họ và tên người nhận</label>
                    <input 
                      type="text" 
                      placeholder="Nguyễn Văn A"
                      required
                      value={shippingName} 
                      onChange={(e) => setShippingName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#444651]">Số điện thoại liên lạc</label>
                    <input 
                      type="tel" 
                      placeholder="0901234567"
                      required
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#444651]">Địa chỉ chi tiết (Số nhà, Đô thị, Tỉnh thành)</label>
                    <textarea 
                      placeholder="Tòa Landmark 81, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh"
                      required
                      rows={3}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3b82f6]"
                    />
                  </div>

                  <button
                    disabled={!shippingName || !shippingPhone || !shippingAddress}
                    onClick={() => setCheckoutStep(2)}
                    className="w-full py-3 bg-[#0058be] hover:bg-[#00236f] text-white font-semibold text-xs rounded-lg shadow disabled:opacity-40 transition uppercase"
                  >
                    Tiếp tục chọn hình thức thanh toán
                  </button>
                </div>

                {/* Cart summary box right side */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between h-fit">
                  <div>
                    <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-4">Tóm tắt đơn hàng</h4>
                    
                    <div className="max-h-[220px] overflow-y-auto mb-4 space-y-3 pr-2">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-center text-xs">
                          <div className="max-w-[70%]">
                            <p className="font-semibold text-slate-800 line-clamp-1">{item.product.name}</p>
                            <p className="text-slate-400 font-medium">SL: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-slate-700">{formatVND(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Giá trị đơn</span>
                        <span>{formatVND(getSubtotal())}</span>
                      </div>
                      
                      {/* Coupon entry */}
                      <div className="pt-2 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Mã giảm giá (ví dụ: TECHSTARTUP)"
                          value={promotionCode}
                          onChange={(e) => setPromotionCode(e.target.value)}
                          className="flex-1 px-3 py-1 bg-white border border-slate-200 rounded text-xs select-all text-slate-800 placeholder-slate-400"
                        />
                        <button 
                          onClick={applyPromo}
                          type="button"
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded cursor-pointer"
                        >
                          Áp dụng
                        </button>
                      </div>
                      
                      {promoError && <p className="text-[10px] text-[#ba1a1a] font-medium">{promoError}</p>}
                      {promoSuccess && <p className="text-[10px] text-emerald-600 font-semibold">{promoSuccess}</p>}

                      {discountPercent > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>Giảm giá ({discountPercent}%)</span>
                          <span>-{formatVND(getDiscountAmount())}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm font-extrabold text-[#ba1a1a] pt-2 border-t border-slate-100">
                        <span>Tổng cộng</span>
                        <span>{formatVND(getTotal())}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* CHECKOUT STEP 2: Choose bank transfer, card, COD */}
            {checkoutStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* List dynamic options */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-[#1a1b21] uppercase tracking-wider mb-2">Lựa chọn cổng thanh toán</h3>

                  <div className="space-y-3">
                    {/* Bank transfer payment box */}
                    <div 
                      onClick={() => setPaymentMethod("Bank Transfer")}
                      className={`p-4 border rounded-xl cursor-pointer transition flex items-start gap-3 ${paymentMethod === "Bank Transfer" ? "bg-blue-50/50 border-[#0058be]" : "bg-white border-slate-200 hover:border-slate-300"}`}
                    >
                      <input 
                        type="radio" 
                        name="pay" 
                        checked={paymentMethod === "Bank Transfer"}
                        onChange={() => setPaymentMethod("Bank Transfer")}
                        className="mt-1 cursor-pointer"
                      />
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-800">Chuyển khoản ATM nội bộ (Khuyên dùng)</p>
                        <p className="text-xs text-slate-500 mt-1">Nhanh chóng, chính xác. Bạn sẽ nhận được mã giao dịch QR quét nhanh ngay lập tức.</p>
                      </div>
                    </div>

                    {/* COD payment box */}
                    <div 
                      onClick={() => setPaymentMethod("COD")}
                      className={`p-4 border rounded-xl cursor-pointer transition flex items-start gap-3 ${paymentMethod === "COD" ? "bg-blue-50/50 border-[#0058be]" : "bg-white border-slate-200 hover:border-slate-300"}`}
                    >
                      <input 
                        type="radio" 
                        name="pay" 
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="mt-1 cursor-pointer"
                      />
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-800">Thanh toán lúc nhận hàng (COD)</p>
                        <p className="text-xs text-slate-500 mt-1">Được kiểm tra phần cứng thiết bị trước khi thanh toán cho shipper.</p>
                      </div>
                    </div>

                    {/* Credit Card card entry */}
                    <div 
                      onClick={() => setPaymentMethod("Credit Card")}
                      className={`p-4 border rounded-xl cursor-pointer transition flex items-start gap-3 ${paymentMethod === "Credit Card" ? "bg-blue-50/50 border-[#0058be]" : "bg-white border-slate-200 hover:border-slate-300"}`}
                    >
                      <input 
                        type="radio" 
                        name="pay" 
                        checked={paymentMethod === "Credit Card"}
                        onChange={() => setPaymentMethod("Credit Card")}
                        className="mt-1 cursor-pointer"
                      />
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-800">Cổng Thẻ Quốc Tế Visa / MasterCard / JCB</p>
                        <p className="text-xs text-slate-500 mt-1">Cổng thanh toán điện tử mã hóa an toàn đạt chuẩn PCI DSS.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg shadow transition uppercase mt-4 tracking-wide"
                  >
                    Xác nhận đặt đơn và ký hợp đồng giao dịch
                  </button>
                </div>

                {/* Bank transfer payment instructions detail show */}
                <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-slate-800 font-sans">
                  {paymentMethod === "Bank Transfer" ? (
                    <div className="text-center space-y-4">
                      <p className="text-xs font-bold text-[#00236f] uppercase tracking-wider">Thông tin chuyển khoản nhanh TechStore</p>
                      
                      <div className="p-4 bg-white rounded-lg border border-slate-200 text-left font-mono space-y-2 text-xs">
                        <p>🏦 Ngân hàng: <strong>VPBank (Việt Nam Thịnh Vượng)</strong></p>
                        <p>💼 Số tài khoản: <strong>666.0023.69999</strong></p>
                        <p>👤 Chủ tài khoản: <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ TECHSTORE VIỆT NAM</strong></p>
                        <p>💰 Số tiền cần gửi: <strong className="text-[#ba1a1a] text-sm">{formatVND(getTotal())}</strong></p>
                        <p>📝 Nội dung chuyển khoản: <strong className="text-[#0c4a6e]">TS CK {shippingPhone}</strong></p>
                      </div>

                      <div className="p-3 bg-blue-50 text-blue-800 text-[11px] rounded border border-blue-100/50 leading-relaxed text-left">
                        Hệ thống kiểm tra ngân hàng tự động phát hiện số tiền trong vòng 20 giây và chuyển tiếp đơn hàng của bạn sang chế độ <strong>"Đang giao hàng"</strong> ngay tắp lự.
                      </div>
                    </div>
                  ) : paymentMethod === "COD" ? (
                    <div className="text-left space-y-2 text-xs text-slate-600 leading-relaxed pt-2">
                       Chế độ Thanh toán khi nhận hàng (COD) cho các đơn hàng giá trị cao cần sự xác nhận bằng mã SMS gửi đến số điện thoại <strong>{shippingPhone}</strong>. Cửa hàng sẽ gọi điện kiểm tra địa chỉ trước khi điều phối bưu tá. Xin vui lòng giữ máy.
                    </div>
                  ) : (
                    <div className="text-left space-y-4 text-xs pt-2">
                      <p className="font-semibold text-slate-700">Điền thông tin Thẻ thanh toán quốc tế mẫu:</p>
                      <div className="space-y-2 border border-slate-200 p-4 bg-white rounded-lg">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold uppercase">Số thẻ ghi nợ (Visa/Master)</label>
                          <input type="text" placeholder="4221 0045 2291 0021" className="w-full text-xs p-1.5 border border-slate-200 rounded font-mono" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-semibold uppercase">Thời hạn</label>
                            <input type="text" placeholder="12/29" className="w-full text-xs p-1.5 border border-slate-200 rounded font-mono" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-semibold uppercase">CVC bảo mật</label>
                            <input type="text" placeholder="***" className="w-full text-xs p-1.5 border border-slate-200 rounded font-mono" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* CHECKOUT STEP 3: Final confirmation receipt of transaction success */}
            {checkoutStep === 3 && (
              <div className="text-center py-10 max-w-lg mx-auto space-y-6">
                <div className="w-20 h-20 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#1a1b21] font-sans">Đặt hàng thành công!</h2>
                  <p className="text-sm text-slate-500">
                    Cảm ơn bạn đã tin tưởng dịch vụ hạ tầng kỹ thuật chuyên sâu của TechStore. Đơn hàng của bạn đã được lập hợp đồng điện tử và chuẩn bị vận chuyển.
                  </p>
                </div>

                {/* Simulated serial validation code */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left font-mono text-xs space-y-2">
                  <p className="text-slate-400 text-center uppercase text-[10px] tracking-wider mb-2">Thông tin hóa đơn bưu cục</p>
                  <p>📦 Mã tracking nội bộ: <strong>TS-TRK-{Math.floor(1000000 + Math.random() * 9000000)}</strong></p>
                  <p>⚙️ Tiến độ máy chủ: <span className="bg-emerald-100 text-emerald-800 py-0.5 px-2 rounded-full font-sans font-bold text-[10px]">Đang đóng gói linh kiện</span></p>
                  <p>👤 Người nhận: <strong>{shippingName}</strong> ({shippingPhone})</p>
                  <p className="truncate">📍 Điểm phát: {shippingAddress}</p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setActiveTab("history");
                    }}
                    className="flex-1 py-3 bg-[#eeedf4] hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition uppercase duration-200"
                  >
                    Xem Chi Tiết Đơn Hàng
                  </button>
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setActiveTab("catalog");
                    }}
                    className="flex-1 py-3 bg-[#0058be] hover:bg-[#00236f] text-white font-semibold text-xs rounded-lg transition uppercase duration-200 shadow"
                  >
                    Tiếp tục mua hàng
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </section>

      {/* 4. REACTIVE SHOPPING CART SIDE DRAWER */}
      {isCartOpen && (
        <div id="cart-drawer-overlay" className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-fade-in">
          <div 
            id="cart-drawer" 
            className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl animate-slide-in p-6 outline-none"
          >
            {/* Header drawer */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-800">
                <ShoppingCart className="w-5 h-5 text-[#0058be]" />
                <h3 className="font-bold text-base font-sans">Giỏ hàng của bạn</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-lg text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List items inside cart drawer */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="font-semibold text-slate-700">Giỏ hàng rỗng</p>
                  <p className="text-xs text-slate-400 mt-1">Bạn chưa thêm bất cứ linh kiện chuyên nghiệp nào vào giỏ.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-150">
                    
                    <div className="flex-1 text-left">
                      <h5 className="font-bold text-xs text-slate-800 line-clamp-2">{item.product.name}</h5>
                      <span className="text-xs text-[#ba1a1a] font-semibold block mt-1">{formatVND(item.product.price)}</span>
                      
                      {/* Quantity select inputs and indicators */}
                      <div className="flex items-center gap-2 mt-3">
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="w-6 h-6 border bg-white rounded flex items-center justify-center text-xs hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-700 w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="w-6 h-6 border bg-white rounded flex items-center justify-center text-xs hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg self-start transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                ))
              )}
            </div>

            {/* Total calculation footer block inside cart */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng cộng ban đầu</span>
                  <span className="text-lg font-display font-extrabold text-[#ba1a1a]">{formatVND(getSubtotal())}</span>
                </div>
                
                <div className="p-3 bg-amber-50 text-amber-900 border border-amber-100/50 rounded-lg text-xs leading-normal">
                  💡 Bạn có thể áp dụng mã code giảm giá <strong>15%</strong> ở bước đặt hàng tiếp theo để được tối ưu ngân sách tốt nhất!
                </div>

                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                    setCheckoutStep(1);
                  }}
                  className="w-full py-3.5 bg-[#0058be] hover:bg-[#00236f] text-white rounded-lg text-xs font-bold transition shadow-md hover:shadow-xl uppercase tracking-wider cursor-pointer"
                >
                  Xác nhận tiến hành Thanh toán
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. PRODUCT INTUITIVE DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-500 font-bold font-sans text-sm transition cursor-pointer"
            >
              ✕
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eeedf4] text-[#00236f] rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
              {renderCategoryIcon(selectedProduct.category)}
              {selectedProduct.category}
            </span>

            <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug mb-3">
              {selectedProduct.name}
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 mb-4 text-left">
              <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider mb-2 font-semibold">Thông số kỹ thuật phần cứng:</p>
              <p className="text-xs text-slate-700 font-mono font-medium leading-relaxed bg-white p-3 rounded border border-slate-150">
                {selectedProduct.specs}
              </p>
            </div>

            <div className="space-y-4 text-left">
              <h4 className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Mô tả sản phẩm</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-sans font-light">
                {selectedProduct.description}
              </p>
              
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center bg-slate-50 -mx-6 -mb-6 p-6 mt-6 rounded-b-2xl">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Giá bán lẻ niêm yết</p>
                  <p className="text-lg md:text-xl font-display font-extrabold text-[#ba1a1a]">{formatVND(selectedProduct.price)}</p>
                </div>
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={!selectedProduct.inStock}
                  className={`px-6 py-3 rounded-xl text-xs font-bold transition active:scale-[0.98] cursor-pointer ${selectedProduct.inStock ? "bg-[#0058be] hover:bg-[#00236f] text-white shadow" : "bg-slate-100 text-slate-400"}`}
                >
                  {selectedProduct.inStock ? "Thêm vào giỏ" : "Hết hàng"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

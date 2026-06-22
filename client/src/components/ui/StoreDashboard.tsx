import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Loader2, Database, CheckCircle2, Search, ChevronDown } from "lucide-react";
import { Product } from "../../types";

import { useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";
import { useOrders } from "../../hooks/useOrders";
import { useCopilot } from "../../hooks/useCopilot";
import { useAuth } from "../../contexts/AuthContext";

import { Catalog } from "./Catalog";
import { TechCopilot } from "./TechCopilot";
import { OrderHistory } from "./OrderHistory";
import { CartDrawer } from "./CartDrawer";
import { CheckoutModal } from "./CheckoutModal";

interface StoreDashboardProps {
  userEmail: string;
  onLogout: () => void;
  onLoginClick?: () => void;
  children?: React.ReactNode;
}

export default function StoreDashboard({ userEmail, onLogout, onLoginClick, children }: StoreDashboardProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "ai" | "history">("catalog");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    products,
    loadingProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categoriesDb,
    page,
    setPage,
    totalPages
  } = useProducts();

  const {
    cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotal: getSubtotal,
    toastMessage
  } = useCart(userEmail);

  const {
    orders,
    checkoutStep,
    setCheckoutStep,
    handleCheckout,
    orderId
  } = useOrders(userEmail, setCart);

  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener("openCart", handleOpenCart);
    return () => window.removeEventListener("openCart", handleOpenCart);
  }, [setIsCartOpen]);

  const {
    shippingName,
    setShippingName,
    shippingPhone,
    setShippingPhone,
    shippingAddress,
    setShippingAddress,
    paymentMethod,
    setPaymentMethod,
    handlePlaceOrder
  } = useOrders(userEmail, setCart);

  const {
    chatMessages,
    setChatMessages,
    userInputMessage,
    setUserInputMessage,
    aiLoading,
    handleSendMessage,
    chatSuggestions
  } = useCopilot();

  const onNavigateToAi = () => setActiveTab("ai");
  const onNavigateToCatalog = () => setActiveTab("catalog");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-amber-200 selection:text-amber-900 flex flex-col">
      
      {/* 1. MAIN NAVIGATION HEADER BLOCK */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer shrink-0" onClick={() => { setActiveTab("catalog"); setSelectedCategory("All"); setSearchQuery(""); navigate("/"); }}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#00236f] to-[#0058be] rounded-xl flex items-center justify-center shadow-md transform transition hover:rotate-12">
              <Database className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg md:text-xl text-[#00236f] tracking-tight leading-none">TechStore</h1>
              <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">Pro Hardware</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 flex-1 justify-center px-4 max-w-xl">
            <div className="relative group shrink-0">
              <button className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#0058be] px-2 whitespace-nowrap">
                Danh mục
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2">
                <button 
                  onClick={() => { setSelectedCategory("All"); setActiveTab("catalog"); navigate("/"); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0058be]"
                >
                  Tất cả sản phẩm
                </button>
                {categoriesDb.map(cat => (
                  <button 
                    key={cat._id}
                    onClick={() => { setSelectedCategory(cat._id); setActiveTab("catalog"); navigate("/"); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0058be]"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setActiveTab("catalog");
                navigate("/");
              }}
              className="flex items-center flex-1 bg-slate-100 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#0058be]"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full ml-2 text-slate-700 h-6"
              />
            </form>
          </div>

          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <nav className="hidden xl:flex bg-slate-100/80 p-1 rounded-xl">
              {[
                { id: "ai", label: "Tư vấn với AI", highlight: true },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsCheckoutOpen(false);
                    navigate("/");
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id && !children
                      ? "bg-white text-[#0058be] shadow-sm" 
                      : tab.highlight 
                        ? "text-amber-600 hover:bg-white/50" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }`}
                >
                  {tab.highlight && <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse"></span>}
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="w-px h-6 bg-slate-200 mx-1 md:mx-2 hidden md:block"></div>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 md:p-2.5 text-slate-600 hover:bg-blue-50 hover:text-[#0058be] rounded-xl transition duration-250 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              {cart.length > 0 && (
                <span className="absolute 1 top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full px-1 border-2 border-white shadow-sm">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {userEmail ? (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3 ml-1">
                <div 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => navigate("/profile")}
                  title="Xem hồ sơ cá nhân"
                >
                  <div className="w-8 h-8 bg-[#00236f] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-inner group-hover:bg-[#0058be] transition-colors">
                    {userEmail.substring(0,2).toUpperCase()}
                  </div>
                  <div className="hidden lg:block mr-2 group-hover:opacity-80 transition-opacity">
                    <p className="text-xs font-bold text-slate-500 leading-tight">Xin chào,</p>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">
                      {user?.fullName 
                        ? (user.fullName.length > 20 ? user.fullName.split(' ').pop() : user.fullName) 
                        : "Khách"
                      }
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLogoutModal(true)}
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

      {/* 2. DYNAMIC MAIN CONTENT SECTIONS */}
      <section className="flex-1 flex flex-col relative py-6">
        
        {children ? (
          children
        ) : (
          <>
            {/* TAB 1: Shopping Catalog View */}
            {activeTab === "catalog" && !isCheckoutOpen && (
          <Catalog
            products={products}
            loadingProducts={loadingProducts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categoriesDb={categoriesDb}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            onAddToCart={addToCart}
            onSelectProduct={(p) => navigate(`/products/${p.slug}`)}
            onNavigateToAi={onNavigateToAi}
          />
        )}

        {/* TAB 2: AI Tech Assistant Workspace */}
        {activeTab === "ai" && !isCheckoutOpen && (
          <div className="flex-1 max-w-[1280px] w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
            <TechCopilot
              chatMessages={chatMessages}
              setChatMessages={setChatMessages as any}
              userInputMessage={userInputMessage}
              setUserInputMessage={setUserInputMessage}
              aiLoading={aiLoading}
              handleSendMessage={handleSendMessage}
              chatSuggestions={chatSuggestions}
            />
          </div>
        )}

        {/* TAB 3: Placed orders history */}
        {activeTab === "history" && !isCheckoutOpen && (
          <div className="flex-1 max-w-[1280px] w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
            <OrderHistory
              orders={orders}
              userEmail={userEmail}
              onNavigateToCatalog={onNavigateToCatalog}
            />
          </div>
        )}

        {/* 3. STEP BY STEP CHECKOUT MODULE VIEW */}
        {isCheckoutOpen && (
          <div className="flex-1 max-w-[1280px] w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
            <CheckoutModal
              isCheckoutOpen={isCheckoutOpen}
              setIsCheckoutOpen={setIsCheckoutOpen}
              checkoutStep={checkoutStep}
              setCheckoutStep={setCheckoutStep}
              cart={cart}
              getSubtotal={getSubtotal}
              shippingName={shippingName}
              setShippingName={setShippingName}
              shippingPhone={shippingPhone}
              setShippingPhone={setShippingPhone}
              shippingAddress={shippingAddress}
              setShippingAddress={setShippingAddress}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              handlePlaceOrder={() => handlePlaceOrder(cart).then(res => {
                if (res) {
                  setCheckoutStep(3);
                }
              })}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
        </>
        )}
      </section>

      {/* 4. REACTIVE SHOPPING CART SIDE DRAWER */}
      <CartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        updateCartQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getSubtotal={getSubtotal}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 5. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-sm z-50 animate-slide-up flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận đăng xuất</h3>
              <p className="text-sm text-slate-500">Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?</p>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

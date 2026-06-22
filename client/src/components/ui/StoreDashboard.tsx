import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Loader2, Database, CheckCircle2 } from "lucide-react";
import { Product } from "../../types";

import { useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";
import { useOrders } from "../../hooks/useOrders";
import { useCopilot } from "../../hooks/useCopilot";

import { Catalog } from "./Catalog";
import { TechCopilot } from "./TechCopilot";
import { OrderHistory } from "./OrderHistory";
import { CartDrawer } from "./CartDrawer";
import { CheckoutModal } from "./CheckoutModal";

interface StoreDashboardProps {
  userEmail: string;
  onLogout: () => void;
  onLoginClick?: () => void;
}

export default function StoreDashboard({ userEmail, onLogout, onLoginClick }: StoreDashboardProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "ai" | "history">("catalog");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  const {
    products,
    loadingProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categoriesDb
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
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => setActiveTab("catalog")}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#00236f] to-[#0058be] rounded-xl flex items-center justify-center shadow-md transform transition hover:rotate-12">
              <Database className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg md:text-xl text-[#00236f] tracking-tight leading-none">TechStore</h1>
              <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">Pro Hardware</p>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <nav className="hidden md:flex bg-slate-100/80 p-1 rounded-xl">
              {[
                { id: "catalog", label: "Cửa Hàng" },
                { id: "ai", label: "Hỏi AI Copilot", highlight: true },
                { id: "history", label: "Đơn Hàng" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsCheckoutOpen(false);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === tab.id 
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
                <div className="w-8 h-8 bg-[#00236f] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-inner">
                  {userEmail.substring(0,2).toUpperCase()}
                </div>
                <div className="hidden lg:block mr-2">
                  <p className="text-xs font-bold text-slate-700 leading-tight">Mức hạng: Bạc</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{userEmail}</p>
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

      {/* 2. DYNAMIC MAIN CONTENT SECTIONS */}
      <section className="flex-1 flex flex-col relative py-6">
        
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

    </div>
  );
}

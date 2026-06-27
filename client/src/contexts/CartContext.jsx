import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import { useAlert } from "./AlertContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get("/cart");
      setCart(response.data?.data?.cart || null);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return showAlert("Vui lòng đăng nhập để thêm vào giỏ hàng", "error");
    try {
      const response = await api.post("/cart", { productId, quantity });
      setCart(response.data?.data?.cart);
    } catch (error) {
      console.error("Failed to add to cart", error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user) return;
    try {
      const response = await api.patch("/cart/update-quantity", { productId, quantity });
      setCart(response.data?.data?.cart);
    } catch (error) {
      console.error("Failed to update cart quantity", error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      const response = await api.delete(`/cart/${productId}`);
      setCart(response.data?.data?.cart);
    } catch (error) {
      console.error("Failed to remove from cart", error);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await api.delete("/cart");
      setCart(null);
    } catch (error) {
      console.error("Failed to clear cart", error);
    }
  };

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

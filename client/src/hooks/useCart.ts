import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { CartItem, Product } from "../../types";

export function useCart(userEmail: string) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Lấy giỏ hàng từ server
  useEffect(() => {
    const fetchCart = () => {
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
      }
    };
    
    fetchCart();
    
    // Lắng nghe sự kiện cartUpdated để đồng bộ giỏ hàng khi thêm từ các trang khác
    window.addEventListener("cartUpdated", fetchCart);
    return () => window.removeEventListener("cartUpdated", fetchCart);
  }, [userEmail]);

  const addToCart = useCallback(async (product: Product) => {
    if (!userEmail) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    const currentCart = [...cart];
    const existingItemIndex = currentCart.findIndex(item => item.product.id === product.id);

    if (existingItemIndex !== -1) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({ product, quantity: 1 });
    }
    
    setCart(currentCart);
    setToastMessage(`Đã thêm ${product.name} vào giỏ hàng`);
    setTimeout(() => setToastMessage(null), 3000);

    try {
      await api.post("/cart", { productId: product.id, quantity: 1 });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng trên DB:", error);
      // rollback UI if needed
    }
  }, [cart, userEmail]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    const previousCart = [...cart];
    if (quantity < 1) return;

    setCart(cart.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));

    try {
      await api.patch("/cart/update-quantity", { productId, quantity });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Lỗi cập nhật giỏ hàng DB:", error);
      setCart(previousCart); // rollback
    }
  }, [cart]);

  const removeFromCart = useCallback(async (productId: string) => {
    const previousCart = [...cart];
    setCart(cart.filter(item => item.product.id !== productId));
    setSelectedItemIds(prev => prev.filter(id => id !== productId));

    try {
      await api.delete(`/cart/${productId}`);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Lỗi xóa sản phẩm DB:", error);
      setCart(previousCart); // rollback
    }
  }, [cart]);

  const getTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const getCartCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const getSelectedTotal = useCallback(() => {
    return cart
      .filter(item => selectedItemIds.includes(item.product.id))
      .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart, selectedItemIds]);

  const toggleItemSelection = useCallback((productId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const toggleAllSelection = useCallback((isSelected: boolean) => {
    if (isSelected) {
      setSelectedItemIds(cart.map(item => item.product.id));
    } else {
      setSelectedItemIds([]);
    }
  }, [cart]);

  return {
    cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    getTotal,
    getCartCount,
    toastMessage,
    selectedItemIds,
    setSelectedItemIds,
    toggleItemSelection,
    toggleAllSelection,
    getSelectedTotal
  };
}

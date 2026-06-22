import { useState, useEffect } from "react";
import api from "../services/api";
import { Order } from "../../types";

export function useOrders(userEmail: string, setCart: (cart: any[]) => void) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [discountCode, setDiscountCode] = useState("");

  useEffect(() => {
    if (userEmail) {
      api.get("/orders")
        .then(res => {
          if (res.data.status === "success") {
            const mappedOrders = res.data.data.orders.map((o: any) => ({
              id: o._id,
              date: new Date(o.createdAt).toLocaleDateString("vi-VN") + " " + new Date(o.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              items: o.items.map((i: any) => ({
                product: { id: i.productId, name: i.name, image: i.image, price: i.price },
                quantity: i.quantity
              })),
              total: o.totalAmount,
              fullName: o.shippingAddress.fullName,
              address: o.shippingAddress.address,
              phone: o.shippingAddress.phone,
              paymentMethod: o.paymentMethod,
              status: o.status
            }));
            setOrders(mappedOrders);
          }
        })
        .catch(err => console.error("Lỗi lấy đơn hàng:", err));
    }
  }, [userEmail]);

  const handlePlaceOrder = async (cart: any[]) => {
    if (!shippingName || !shippingPhone || !shippingAddress) {
      alert("Vui lòng điền đầy đủ thông tin giao nhận.");
      return;
    }

    try {
      const pmMap: Record<string, string> = {
        "Bank Transfer": "BANK_TRANSFER",
        "COD": "COD",
        "Credit Card": "CREDIT_CARD"
      };

      const res = await api.post("/orders", {
        shippingAddress: {
          fullName: shippingName,
          phone: shippingPhone,
          address: shippingAddress
        },
        paymentMethod: pmMap[paymentMethod] || "COD"
      });

      if (res.data.status === "success") {
        const o = res.data.data.order;
        const newOrder: Order = {
          id: o._id,
          date: new Date(o.createdAt).toLocaleDateString("vi-VN") + " " + new Date(o.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          items: [...cart],
          total: o.totalAmount,
          fullName: o.shippingAddress.fullName,
          address: o.shippingAddress.address,
          phone: o.shippingAddress.phone,
          paymentMethod: paymentMethod, 
          status: o.status
        };

        setOrders([newOrder, ...orders]);
        setCart([]);
        setCheckoutStep(3);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng");
    }
  };

  return {
    orders,
    setOrders,
    checkoutStep,
    setCheckoutStep,
    shippingName, setShippingName,
    shippingPhone, setShippingPhone,
    shippingAddress, setShippingAddress,
    paymentMethod, setPaymentMethod,
    discountCode, setDiscountCode,
    handlePlaceOrder
  };
}

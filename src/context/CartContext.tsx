import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  addCustomerCartItem,
  clearCustomerCart,
  getCustomerCart,
  removeCustomerCartItem,
} from "../lib/customerApi";
import { Service } from "../types/service";

export type CartItem = {
  id: string;
  service_id: string;
  title: string;
  duration: string;
  price: string;
  image?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  loadingCart: boolean;

  fetchCart: () => Promise<void>;

  // Returns true if added successfully
  addToCart: (service: Service) => Promise<boolean>;

  // Delete by service_id
  removeFromCart: (service_id: string) => Promise<void>;

  clearCart: () => Promise<void>;

  isInCart: (service_id: string) => boolean;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

  // ======================================================
  // FETCH CART
  // ======================================================
  const fetchCart = async () => {
    setLoadingCart(true);
    try {
      const data = await getCustomerCart();
      setCartItems((data as any) || []);
    } catch (err: any) {
      console.log("[CUSTOMER FASTAPI] fetchCart error:", err.message);
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  };

  // ======================================================
  // ADD TO CART
  // ======================================================
  const addToCart = async (service: Service) => {
    try {
      await addCustomerCartItem({
        service_id: service.id,
        title: service.title,
        duration: String(service.duration || ""),
        price: String(service.price || ""),
        image: service.image,
      });

      await fetchCart();
      return true;
    } catch (err: any) {
      console.error("[CUSTOMER FASTAPI] addToCart error:", err);
      throw err;
    }
  };

  // ======================================================
  // REMOVE FROM CART (BY service_id)
  // ======================================================
  const removeFromCart = async (service_id: string) => {
    try {
      await removeCustomerCartItem(service_id);
      await fetchCart();
    } catch (err: any) {
      console.error("[CUSTOMER FASTAPI] removeFromCart error:", err);
      throw err;
    }
  };

  // ======================================================
  // CLEAR CART
  // ======================================================
  const clearCart = async () => {
    try {
      await clearCustomerCart();
      setCartItems([]);
    } catch (err: any) {
      console.error("[CUSTOMER FASTAPI] clearCart error:", err);
      throw err;
    }
  };

  // ======================================================
  // CHECK IF IN CART
  // ======================================================
  const isInCart = (service_id: string) => {
    return cartItems.some((x) => x.service_id === service_id);
  };

  // Auto fetch cart after app opens
  useEffect(() => {
    fetchCart();
  }, []);

  const value = useMemo(
    () => ({
      cartItems,
      loadingCart,
      fetchCart,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
    }),
    [cartItems, loadingCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}


import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useCafe } from "./CafeProvider";

const CartContext = createContext(null);

const TAX_RATE = 0.05;

export function CartProvider({ children }) {
  const { cafeId } = useCafe();
  const [items, setItems] = useState([]);
  const [tableId, setTableId] = useState(null);

  // Reset cart if cafe changes
  useEffect(() => {
    setItems([]);
  }, [cafeId]);

  const addItem = useCallback((item) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback(
    (index, quantity) => {
      if (quantity < 1) {
        removeItem(index);
        return;
      }
      setItems((prev) =>
        prev.map((item, i) => {
          if (i !== index) return item;
          const basePrice = parseFloat(item.menuItem.price);
          const addonsPrice = (item.selectedAddons || []).reduce((sum, addon) => sum + parseFloat(addon.price), 0);
          const totalPrice = (basePrice + addonsPrice) * quantity;
          return { ...item, quantity, totalPrice };
        })
      );
    },
    [removeItem]
  );

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cart: items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart: clear,
        totalItems,
        subtotal,
        totalAmount: total,
        tax,
        total,
        setTableId
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

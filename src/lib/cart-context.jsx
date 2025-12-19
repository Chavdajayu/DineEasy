import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

const TAX_RATE = 0.1;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

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
          const addonsPrice = item.selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price), 0);
          const totalPrice = (basePrice + addonsPrice) * quantity;
          return { ...item, quantity, totalPrice };
        })
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        tax,
        total,
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


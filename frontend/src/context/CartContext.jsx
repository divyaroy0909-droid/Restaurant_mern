import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { call } from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { isUser } = useAuth();
  const [items, setItems] = useState([]); // [{ menuItem: {...}, quantity }]

  const refresh = useCallback(async () => {
    if (!isUser) { setItems([]); return; }
    try {
      const data = await call(api.get("/cart/get"));
      // Backend returns { items: [] } for an empty cart, { cart } otherwise.
      const list = data.cart?.items || data.items || [];
      setItems(list.filter((i) => i.menuItem)); // skip deleted menu items
    } catch {
      setItems([]);
    }
  }, [isUser]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async (menuId, quantity = 1) => {
    await call(api.post("/cart/add", { menuId, quantity }));
    await refresh();
  };

  const remove = async (menuId) => {
    await call(api.delete(`/cart/remove/${menuId}`));
    await refresh();
  };

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((n, i) => n + i.menuItem.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

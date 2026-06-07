import { createContext, useContext, useState } from "react";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [order, setOrder] = useState([]);

  const addOrder = ({ cartItems, total, shipping, name, phone, address, note }) => {
    const newOrder = {
      id: `FM${Date.now()}`,
      date: new Date().toISOString(),
      name,
      phone,
      address,
      note,
      items: cartItems.map((item) => ({ ...item })),
      subtotal: total,
      shipping,
      total: total + shipping,
      status: "confirmed", // confirmed | shipping | delivered
    };
    setOrder((prev) => [newOrder, ...prev]);
    return newOrder.id;
  };

  return (
    <OrderContext.Provider value={{ order, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}
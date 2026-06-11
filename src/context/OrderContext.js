import { createContext, useContext, useState, useEffect } from "react";

const OrderContext = createContext();

const STORAGE_KEY = "foodmart_orders";

// Utility functions
const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error("Error saving orders to localStorage:", error);
  }
};

const loadOrdersFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading orders from localStorage:", error);
    return [];
  }
};

export function OrderProvider({ children }) {
  const [order, setOrder] = useState(() => loadOrdersFromStorage());

  // Lưu vào localStorage mỗi khi order thay đổi
  useEffect(() => {
    saveOrdersToStorage(order);
  }, [order]);

  const addOrder = ({ cartItems, total, shipping, name, phone, address, note, userId, email }) => {
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
      status: "confirmed",
      userId: userId,
      email: email,
    };
    
    setOrder((prev) => [newOrder, ...prev]);
    return newOrder.id;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrder((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const deleteOrder = (orderId) => {
    setOrder((prev) => prev.filter((o) => o.id !== orderId));
  };

  const getOrdersByUser = (userId, email) => {
    if (!userId && !email) return [];
    return order.filter((o) => o.userId === userId || o.email === email);
  };

  const getAllOrders = () => order;

  return (
    <OrderContext.Provider value={{ 
      order, 
      addOrder, 
      updateOrderStatus, 
      deleteOrder,
      getOrdersByUser,
      getAllOrders 
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}

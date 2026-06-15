import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Tải thông báo từ localStorage khi user đăng nhập
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`notifs_${user.id}`);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        const welcomeNotif = {
          id: Date.now(),
          text: "🎉 Chào mừng bạn đến với FreshMart!",
          date: new Date().toISOString(),
          read: false
        };
        setNotifications([welcomeNotif]);
        localStorage.setItem(`notifs_${user.id}`, JSON.stringify([welcomeNotif]));
      }
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Hàm thêm thông báo mới
  const addNotification = (text) => {
    if (!user) return;
    const newNotif = { id: Date.now(), text, date: new Date().toISOString(), read: false };
    
    setNotifications((prev) => {
      const updated = [newNotif, ...prev].slice(0, 20); // Giữ lại tối đa 20 thông báo gần nhất
      localStorage.setItem(`notifs_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Hàm đánh dấu tất cả đã đọc
  const markAllAsRead = () => {
    if (!user) return;
    setNotifications((prev) => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(`notifs_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const defaultUsers = [
  {
    id: 1,
    name: "Admin FoodMart",
    email: "admin@foodmart.vn",
    password: "admin123",
    role: "admin",
  },
  {
    id: 2,
    name: "Demo User",
    email: "demo@foodmart.vn",
    password: "123456",
    role: "user",
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(defaultUsers);

  const login = (email, password) => {
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const register = (name, email, password) => {
    const exists = users.find((u) => u.email === email);
    if (exists) return false;
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role: "user", // Người đăng ký luôn là user
    };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
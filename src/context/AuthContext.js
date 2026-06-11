import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AUTH_STORAGE_KEY = "foodmart_auth";
const USERS_STORAGE_KEY = "foodmart_users";

const defaultUsers = [
  {
    id: 1,
    name: "Admin FoodMart",
    tenDangNhap: "admin",
    email: "admin@foodmart.vn",
    password: "admin123",
    diaChi: "Hà Nội",
    soDienThoai: "0901234567",
    ngayDangKy: "2024-01-01T00:00:00.000Z",
    role: "admin",
    savedAddresses: [],
  },
  {
    id: 2,
    name: "Demo User",
    tenDangNhap: "demouser",
    email: "demo@foodmart.vn",
    password: "123456",
    diaChi: "Hồ Chí Minh",
    soDienThoai: "0987654321",
    ngayDangKy: "2024-01-02T00:00:00.000Z",
    role: "user",
    savedAddresses: [],
  },
];

// Utility functions
const saveUsersToStorage = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users to localStorage:", error);
  }
};

const loadUsersFromStorage = () => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : defaultUsers;
  } catch (error) {
    console.error("Error loading users from localStorage:", error);
    return defaultUsers;
  }
};

const saveCurrentUserToStorage = (user) => {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error saving current user to localStorage:", error);
  }
};

const loadCurrentUserFromStorage = () => {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading current user from localStorage:", error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadCurrentUserFromStorage());
  const [users, setUsers] = useState(() => loadUsersFromStorage());

  // Lưu current user khi thay đổi
  useEffect(() => {
    saveCurrentUserToStorage(user);
  }, [user]);

  // Lưu danh sách users khi thay đổi
  useEffect(() => {
    saveUsersToStorage(users);
  }, [users]);

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

  const register = (data) => {
    const exists = users.find((u) => u.email === data.email);
    if (exists) return false;
    const newUser = {
      id: Date.now(),
      name: data.name,
      tenDangNhap: data.tenDangNhap || data.email.split("@")[0],
      email: data.email,
      password: data.password,
      diaChi: data.diaChi || "",
      soDienThoai: data.soDienThoai || "",
      ngayDangKy: new Date().toISOString(),
      role: "user",
      savedAddresses: [],
    };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  const updateProfile = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
    );
  };

  const logout = () => setUser(null);
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, users, login, register, logout, isAdmin, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

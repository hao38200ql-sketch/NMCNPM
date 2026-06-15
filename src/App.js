import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { LangProvider } from "./context/LangContext";
import { ProductProvider } from "./context/ProductContext";
import { OrderProvider } from "./context/OrderContext";
import { VoucherProvider } from "./context/VoucherContext";
import { useAuth } from "./context/AuthContext";
import Menu from "./components/Menu";
import Home from "./components/Home";
import Product from "./components/Product";
import Detail from "./components/Detail";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Admin from "./components/Admin";
import Order from "./components/Order";
import Profile from "./components/Profile";
import Voucher from "./components/Voucher";
import LuckyWheel from './pages/LuckyWheel';
import { NotificationProvider } from './context/NotificationContext';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Menu />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Product />} />
        <Route path="/category/:category" element={<Product />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/order" element={<PrivateRoute><Order /></PrivateRoute>} />
        <Route path="/voucher" element={<PrivateRoute><Voucher /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/lucky-wheel" element={<LuckyWheel />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <OrderProvider>
              <NotificationProvider> {/* <-- BỌC VÀO ĐÂY */}
              <VoucherProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </VoucherProvider>
              </NotificationProvider>
            </OrderProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </LangProvider>
  );
}

export default App;
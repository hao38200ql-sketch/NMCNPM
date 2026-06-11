import { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";

function Menu() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const { lang, t, toggleLang } = useLang();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const dropdownRef = useRef(null);

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchText.trim())}`);
      setSearchText("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAdmin = user?.role === "admin";

  const categories = [
    { key: "ngu-coc", label: t.nguCoc, icon: "🌾" },
    { key: "banh-mi", label: t.banhMi, icon: "🍞" },
    { key: "sua-trung", label: t.suaTrung, icon: "🥛" },
    { key: "thit", label: t.thit, icon: "🥩" },
    { key: "hai-san", label: t.haiSan, icon: "🦐" },
    { key: "rau-cu", label: t.rauCu, icon: "🥦" },
    { key: "trai-cay", label: t.traiCay, icon: "🍎" },
    { key: "do-uong", label: "Đồ Uống", icon: "🥤" },
  ];

  return (
    <header style={styles.header}>
      {/* Top bar */}
      <div style={styles.topBar}>
        {/* Logo */}
        <div style={styles.logo} onClick={() => navigate("/")}>
          <span style={styles.logoIcon}>🛒</span>
          <div>
            <span style={styles.logoText}>FoodMart</span>
            <span style={styles.logoSub}>Siêu Thị Online</span>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={styles.searchInput}
          />
          <button style={styles.searchBtn} onClick={handleSearch}>🔍</button>
        </div>

        {/* Top Right */}
        <div style={styles.topRight}>
          {/* User */}
          {user ? (
            <div style={styles.userBox} ref={dropdownRef}>
              <div
                style={{
                  ...styles.avatar,
                  backgroundColor: isAdmin ? "#e53e3e" : "#f6ad55",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/profile")}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <div style={styles.userNameRow}>
                  <span
                    style={{
                      ...styles.userName,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate("/profile")}
                  >
                    {t.hello}, {user.name.split(" ").pop()}!
                  </span>
                  {isAdmin && <span style={styles.adminBadge}>ADMIN</span>}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    style={styles.profileBtn}
                    onClick={() => navigate("/profile")}
                  >
                    👤 Hồ sơ
                  </button>
                  {isAdmin ? (
                    <button
                      style={styles.adminLinkBtn}
                      onClick={() => navigate("/admin")}
                    >
                      ⚙️ Quản trị
                    </button>
                  ) : (
                    <button
                      style={styles.orderLinkBtn}
                      onClick={() => navigate("/order")}
                    >
                      📦 Đơn hàng
                    </button>
                  )}
                  <button
                    style={styles.logoutBtn}
                    onClick={handleLogout}
                  >
                    {t.logout}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button style={styles.loginBtn} onClick={() => navigate("/login")}>
              👤 {t.login}
            </button>
          )}

          {/* Cart */}
          <div style={styles.cartBtn} onClick={() => navigate("/cart")}>
            <span style={{ fontSize: "22px" }}>🛒</span>
            <div style={styles.cartInfo}>
              <span style={styles.cartLabel}>{t.cart}</span>
              <span style={styles.cartCount}>{cartCount} {t.cartItems}</span>
            </div>
            {cartCount > 0 && (
              <span style={styles.cartBadge}>{cartCount}</span>
            )}
          </div>

          {/* Language Toggle */}
          <button style={styles.langBtn} onClick={toggleLang}>
            {lang === "vi" ? "EN" : "VN"}
          </button>
        </div>
      </div>

      {/* Nav bar */}
      <nav style={styles.navBar}>
        <NavLink
          to="/"
          style={({ isActive }) => ({
            ...styles.navLink,
            backgroundColor: isActive ? "#2d8a5e" : "transparent",
            borderBottom: isActive ? "3px solid #fff" : "3px solid transparent",
          })}
        >
          🏠 {t.home}
        </NavLink>
        <NavLink
          to="/products"
          style={({ isActive }) => ({
            ...styles.navLink,
            backgroundColor: isActive ? "#2d8a5e" : "transparent",
            borderBottom: isActive ? "3px solid #fff" : "3px solid transparent",
          })}
        >
          🏪 {t.allProducts}
        </NavLink>
        {categories.map((cat) => (
          <NavLink
            key={cat.key}
            to={`/category/${cat.key}`}
            style={({ isActive }) => ({
              ...styles.navLink,
              backgroundColor: isActive ? "#2d8a5e" : "transparent",
              borderBottom: isActive ? "3px solid #fff" : "3px solid transparent",
            })}
          >
            {cat.icon} {cat.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#38a169",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 32px",
    gap: "16px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    flexShrink: 0,
  },
  logoIcon: { fontSize: "32px" },
  logoText: {
    color: "white",
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "1px",
    fontFamily: "sans-serif",
    display: "block",
  },
  logoSub: {
    color: "#c6f6d5",
    fontSize: "11px",
    fontFamily: "sans-serif",
  },
  searchBar: {
    display: "flex",
    flex: 1,
    maxWidth: "500px",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
  },
  searchInput: {
    flex: 1,
    padding: "10px 16px",
    border: "none",
    fontSize: "14px",
    outline: "none",
    fontFamily: "sans-serif",
  },
  searchBtn: {
    backgroundColor: "#f6ad55",
    border: "none",
    padding: "10px 18px",
    cursor: "pointer",
    fontSize: "16px",
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  },
  langBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    border: "2px solid rgba(255,255,255,0.4)",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap",
  },
  loginBtn: {
    backgroundColor: "white",
    color: "#38a169",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "sans-serif",
  },

  /* User Box */
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 14px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "10px",
    fontFamily: "sans-serif",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  userNameRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  userName: {
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "sans-serif",
  },
  adminBadge: {
    backgroundColor: "#e53e3e",
    color: "white",
    fontSize: "10px",
    fontWeight: "800",
    padding: "2px 6px",
    borderRadius: "4px",
    whiteSpace: "nowrap",
  },
  profileBtn: {
    backgroundColor: "#f6ad55",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap",
  },
  orderLinkBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap",
  },
  adminLinkBtn: {
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap",
  },

  /* Cart */
  cartBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: "8px 14px",
    borderRadius: "8px",
    position: "relative",
  },
  cartInfo: { display: "flex", flexDirection: "column" },
  cartLabel: { color: "#c6f6d5", fontSize: "11px", fontFamily: "sans-serif" },
  cartCount: { color: "white", fontSize: "13px", fontWeight: "600", fontFamily: "sans-serif" },
  cartBadge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    backgroundColor: "#fc8181",
    color: "white",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  /* Nav */
  navBar: {
    display: "flex",
    backgroundColor: "#2f855a",
    overflowX: "auto",
    padding: "0 32px",
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: "500",
    whiteSpace: "nowrap",
    fontFamily: "sans-serif",
  },
};

export default Menu;

import { useState, useRef, useEffect } from "react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchText.trim())}`);
      setSearchText("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/");
  };

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

  const settingsItems = [
    { icon: "👤", label: "Tài khoản", key: "account" },
    { icon: "🔒", label: "Quyền riêng tư", key: "privacy" },
    { icon: "🖥️", label: "Màn hình", key: "display" },
    { icon: "♿", label: "Trợ năng", key: "accessibility" },
    { icon: "❓", label: "Trợ giúp", key: "help" },
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
            <div style={styles.settingsWrapper} ref={dropdownRef}>
              <button
                style={styles.settingsBtn}
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <div style={styles.avatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.userInfo}>
                  <span style={styles.userName}>
                    {t.hello}, {user.name.split(" ").pop()}!
                  </span>
                  <span style={styles.userEmail}>{user.email}</span>
                </div>
                <span style={{
                  color: "white",
                  fontSize: "13px",
                  transition: "transform 0.2s",
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}>▾</span>
              </button>

              {dropdownOpen && (
                <div style={styles.dropdown}>
                  {/* Header */}
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownAvatar}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={styles.dropdownName}>{user.name}</p>
                      <p style={styles.dropdownEmail}>{user.email}</p>
                    </div>
                  </div>

                  <div style={styles.dropdownDivider} />

                  <button
                    style={styles.dropdownItem}
                    onClick={() => { setDropdownOpen(false); navigate("/order"); }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0fff4"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <span style={styles.dropdownItemIcon}>📋</span>
                    <span style={styles.dropdownItemLabel}>Đơn hàng của tôi</span>
                    <span style={styles.dropdownArrow}>›</span>
                  </button>

                  {/* Admin */}
                  <button
                    style={styles.dropdownItem}
                    onClick={() => { setDropdownOpen(false); navigate("/admin"); }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0fff4"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <span style={styles.dropdownItemIcon}>⚙️</span>
                    <span style={styles.dropdownItemLabel}>Quản trị Admin</span>
                    <span style={styles.dropdownArrow}>›</span>
                  </button>

                  <div style={styles.dropdownDivider} />

                  {/* Settings */}
                  <p style={styles.dropdownSection}>CÀI ĐẶT</p>
                  {settingsItems.map((item) => (
                    <button
                      key={item.key}
                      style={styles.dropdownItem}
                      onClick={() => {
                        setDropdownOpen(false);
                        alert(`Tính năng "${item.label}" đang được phát triển.`);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0fff4"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <span style={styles.dropdownItemIcon}>{item.icon}</span>
                      <span style={styles.dropdownItemLabel}>{item.label}</span>
                      <span style={styles.dropdownArrow}>›</span>
                    </button>
                  ))}

                  <div style={styles.dropdownDivider} />

                  {/* Logout */}
                  <button
                    style={styles.logoutItem}
                    onClick={handleLogout}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fff5f5"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <span style={styles.dropdownItemIcon}>🚪</span>
                    <span style={{ color: "#e53e3e", fontWeight: "600", fontSize: "14px" }}>
                      {t.logout}
                    </span>
                  </button>
                </div>
              )}
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
        <NavLink
          to="/order"
          style={({ isActive }) => ({
            ...styles.navLink,
            backgroundColor: isActive ? "#2d8a5e" : "transparent",
            borderBottom: isActive ? "3px solid #fff" : "3px solid transparent",
          })}
        >
          📋 Đơn Hàng
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

  /* User dropdown */
  settingsWrapper: { position: "relative", fontFamily: "sans-serif" },
  settingsBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    backgroundColor: "rgba(255,255,255,0.15)",
    border: "none",
    padding: "8px 14px",
    borderRadius: "10px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#f6ad55",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },
  userInfo: { display: "flex", flexDirection: "column", gap: "1px" },
  userName: { color: "white", fontSize: "13px", fontWeight: "600", fontFamily: "sans-serif" },
  userEmail: {
    color: "#c6f6d5",
    fontSize: "11px",
    fontFamily: "sans-serif",
    maxWidth: "130px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    backgroundColor: "white",
    borderRadius: "14px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
    minWidth: "240px",
    padding: "8px",
    zIndex: 2000,
    border: "1px solid #e2e8f0",
  },
  dropdownHeader: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px 12px" },
  dropdownAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#38a169",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "18px",
    flexShrink: 0,
  },
  dropdownName: { fontSize: "14px", fontWeight: "700", color: "#2d3748", margin: "0 0 2px" },
  dropdownEmail: { fontSize: "12px", color: "#718096", margin: 0 },
  dropdownDivider: { height: "1px", backgroundColor: "#e2e8f0", margin: "4px 0" },
  dropdownSection: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#a0aec0",
    letterSpacing: "1px",
    padding: "6px 12px 2px",
    margin: 0,
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "9px 12px",
    border: "none",
    backgroundColor: "transparent",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "sans-serif",
  },
  dropdownItemIcon: { fontSize: "17px", width: "24px", textAlign: "center", flexShrink: 0 },
  dropdownItemLabel: { flex: 1, fontSize: "14px", color: "#2d3748", fontWeight: "500" },
  dropdownArrow: { color: "#a0aec0", fontSize: "16px" },
  logoutItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "9px 12px",
    border: "none",
    backgroundColor: "transparent",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "sans-serif",
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

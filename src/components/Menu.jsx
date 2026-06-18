import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { useNotification } from "../context/NotificationContext";

function Menu() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const { lang, t, toggleLang } = useLang();
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Đóng dropdown user nếu click ra ngoài
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      // Đóng dropdown thông báo nếu click ra ngoài
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    { key: "ngu-coc", label: t?.nguCoc || "Ngũ Cốc", icon: "🌾" },
    { key: "banh-mi", label: t?.banhMi || "Bánh Mì", icon: "🍞" },
    { key: "sua-trung", label: t?.suaTrung || "Sữa Trứng", icon: "🥛" },
    { key: "thit", label: t?.thit || "Thịt", icon: "🥩" },
    { key: "hai-san", label: t?.haiSan || "Hải Sản", icon: "🦐" },
    { key: "rau-cu", label: t?.rauCu || "Rau Củ", icon: "🥦" },
    { key: "trai-cay", label: t?.traiCay || "Trái Cây", icon: "🍎" },
    { key: "do-uong", label: "Đồ Uống", icon: "🥤" },
  ];

  return (
    <header style={styles.header}>
      {/* Top bar */}
      <div style={styles.topBar}>
        {/* Logo */}
        <div style={styles.logo} onClick={() => navigate("/")}>
          <span style={styles.logoIcon}>🌿</span>
          <div>
            <span style={styles.logoText}>FoodMart</span>
            <span style={styles.logoSub}>Siêu Thị Thực Phẩm Sạch</span>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchBar}>
          <span style={styles.searchIconLeft}>🔍</span>
          <input
            type="text"
            placeholder={t?.searchPlaceholder || "Tìm kiếm sản phẩm..."}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={styles.searchInput}
          />
          <button style={styles.searchBtn} onClick={handleSearch}>
            Tìm kiếm
          </button>
        </div>

        {/* Top Right */}
        <div style={styles.topRight}>
          {/* Language Toggle */}
          <button style={styles.langBtn} onClick={toggleLang}>
            {lang === "vi" ? "EN" : "VN"}
          </button>

          {/* QUẢN LÝ THÔNG BÁO (NOTIFICATION BELL) */}
          {user && (
            <div style={styles.notifWrapper} ref={notifRef}>
              <div
                style={styles.cartBtn} // Dùng chung style với nút giỏ hàng để đồng bộ kích thước
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen && unreadCount > 0) markAllAsRead();
                }}
              >
                <span style={{ fontSize: "20px" }}>🔔</span>
                {unreadCount > 0 && (
                  <span style={styles.cartBadge}>{unreadCount}</span>
                )}
              </div>

              {/* Bảng Dropdown Thông Báo */}
              {notifOpen && (
                <div style={styles.notifDropdown}>
                  <h4 style={styles.notifTitle}>Thông báo mới</h4>
                  <div style={styles.notifList}>
                    {notifications.length === 0 ? (
                      <p style={styles.notifEmpty}>Chưa có thông báo nào</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} style={{ ...styles.notifItem, backgroundColor: n.read ? "white" : "#f0fdf4" }}>
                          <p style={styles.notifText}>{n.text}</p>
                          <p style={styles.notifDate}>{new Date(n.date).toLocaleString("vi-VN")}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          <div style={styles.cartBtn} onClick={() => navigate("/cart")}>
            <span style={{ fontSize: "20px" }}>🛒</span>
            {cartCount > 0 && (
              <span style={styles.cartBadge}>{cartCount}</span>
            )}
          </div>

          {/* User */}
          {user ? (
            <div style={styles.userBox} ref={dropdownRef}>
              <div
                style={styles.userTrigger}
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <div
                  style={{
                    ...styles.avatar,
                    backgroundColor: isAdmin ? "#ef4444" : "#22c55e",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.userInfo}>
                  <div style={styles.userNameRow}>
                    <span style={styles.userName}>
                      {t?.hello || "Xin chào"}, {user.name.split(" ").pop()}
                    </span>
                    {isAdmin && <span style={styles.adminBadge}>ADMIN</span>}
                  </div>
                </div>
                <span style={{
                  ...styles.dropdownArrow,
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}>▼</span>
              </div>

              {dropdownOpen && (
                <div style={styles.dropdownMenu}>
                  <button style={styles.dropdownItem} onClick={() => { navigate("/profile"); setDropdownOpen(false); }}>
                    👤 Hồ sơ
                  </button>
                  {isAdmin ? (
                    <button style={styles.dropdownItem} onClick={() => { navigate("/admin"); setDropdownOpen(false); }}>
                      ⚙️ Quản trị
                    </button>
                  ) : (
                    <>
                      <button style={styles.dropdownItem} onClick={() => { navigate("/voucher"); setDropdownOpen(false); }}>
                        🎫 Voucher
                      </button>
                      <button style={styles.dropdownItem} onClick={() => { navigate("/order"); setDropdownOpen(false); }}>
                        📦 Đơn hàng
                      </button>
                      <button style={styles.dropdownItem} onClick={() => { navigate("/lucky-wheel"); setDropdownOpen(false); }}>
                        🎡 Vòng quay may mắn
                      </button>
                    </>
                  )}
                  <div style={styles.dropdownDivider} />
                  <button style={styles.dropdownItemLogout} onClick={() => { handleLogout(); setDropdownOpen(false); }}>
                    🚪 {t?.logout || "Đăng xuất"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button style={styles.loginBtn} onClick={() => navigate("/login")}>
              👤 {t?.login || "Đăng nhập"}
            </button>
          )}
        </div>
      </div>

      {/* Nav bar */}
      <nav style={styles.navBar}>
        <NavLink
          to="/"
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : {}),
          })}
        >
          🏠 {t?.home || "Trang chủ"}
        </NavLink>
        <NavLink
          to="/products"
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : {}),
          })}
        >
          🏪 {t?.allProducts || "Sản phẩm"}
        </NavLink>
        {categories.map((cat) => (
          <NavLink
            key={cat.key}
            to={`/category/${cat.key}`}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
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
    backgroundColor: "#16a34a",
    boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    fontFamily: "sans-serif",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 32px",
    gap: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  },

  /* Logo */
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    flexShrink: 0,
  },
  logoIcon: {
    fontSize: "32px",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: "12px",
    padding: "6px",
    lineHeight: 1,
  },
  logoText: {
    color: "white",
    fontSize: "24px",
    fontWeight: "900",
    letterSpacing: "0.5px",
    fontFamily: "sans-serif",
    display: "block",
  },
  logoSub: {
    color: "#dcfce7",
    fontSize: "11px",
    fontFamily: "sans-serif",
  },

  /* Search */
  searchBar: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    maxWidth: "520px",
    borderRadius: "999px",
    overflow: "hidden",
    backgroundColor: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "0 6px 0 18px",
  },
  searchIconLeft: { fontSize: "15px", color: "#9ca3af", marginRight: "8px" },
  searchInput: {
    flex: 1,
    padding: "11px 0",
    border: "none",
    backgroundColor: "transparent",
    fontSize: "14px",
    outline: "none",
    fontFamily: "sans-serif",
    color: "#374151",
  },
  searchBtn: {
    backgroundColor: "#fb923c",
    color: "white",
    border: "none",
    padding: "10px 22px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap",
  },

  /* Right */
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  langBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.35)",
    padding: "9px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap",
  },
  loginBtn: {
    backgroundColor: "white",
    color: "#16a34a",
    border: "none",
    padding: "10px 20px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap",
  },

  /* Cart & Bell Buttons */
  cartBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backgroundColor: "rgba(255,255,255,0.18)",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    position: "relative",
    flexShrink: 0,
  },
  cartBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    backgroundColor: "#ef4444",
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

  /* Notification Styles */
  notifWrapper: { position: "relative" },
  notifDropdown: { 
    position: "absolute", 
    top: "calc(100% + 8px)", 
    right: 0, 
    backgroundColor: "white", 
    borderRadius: "12px", 
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)", 
    width: "320px", 
    zIndex: 1100, 
    overflow: "hidden", 
    border: "1px solid #e2e8f0" 
  },
  notifTitle: { 
    margin: 0, 
    padding: "14px 16px", 
    backgroundColor: "#f8fafc", 
    borderBottom: "1px solid #e2e8f0", 
    fontSize: "14px", 
    fontWeight: "700", 
    color: "#1f2937",
    fontFamily: "sans-serif"
  },
  notifList: { maxHeight: "350px", overflowY: "auto" },
  notifEmpty: { padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: "13px", margin: 0, fontFamily: "sans-serif" },
  notifItem: { padding: "12px 16px", borderBottom: "1px solid #f1f5f9", cursor: "pointer", fontFamily: "sans-serif" },
  notifText: { margin: "0 0 4px", fontSize: "13px", color: "#374151", lineHeight: "1.4" },
  notifDate: { margin: 0, fontSize: "11px", color: "#9ca3af" },

  /* User Box */
  userBox: {
    position: "relative",
    fontFamily: "sans-serif",
  },
  userTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 12px 6px 6px",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: "999px",
    cursor: "pointer",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "15px",
    flexShrink: 0,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  userNameRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  userName: {
    color: "white",
    fontSize: "13px",
    fontWeight: "700",
    fontFamily: "sans-serif",
    whiteSpace: "nowrap",
  },
  adminBadge: {
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "9px",
    fontWeight: "800",
    padding: "2px 6px",
    borderRadius: "4px",
    whiteSpace: "nowrap",
  },
  dropdownArrow: {
    color: "white",
    fontSize: "10px",
    marginLeft: "2px",
    transition: "transform 0.2s",
  },
  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    padding: "8px",
    minWidth: "180px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    zIndex: 1100,
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "transparent",
    color: "#374151",
    border: "none",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "sans-serif",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  dropdownItemLogout: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "none",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "sans-serif",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  dropdownDivider: {
    height: "1px",
    backgroundColor: "#f3f4f6",
    margin: "4px 0",
  },

  /* Nav */
  navBar: {
    display: "flex",
    backgroundColor: "#15803d",
    overflowX: "auto",
    padding: "0 32px",
    gap: "4px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  navLink: {
    color: "#dcfce7",
    textDecoration: "none",
    padding: "12px 16px",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    fontFamily: "sans-serif",
    borderBottom: "3px solid transparent",
    transition: "color 0.15s, border-color 0.15s",
  },
  navLinkActive: {
    color: "white",
    borderBottom: "3px solid white",
  },
};

export default Menu;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrder } from "../context/OrderContext";

function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { order: orders } = useOrder();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    tenDangNhap: user?.tenDangNhap || "",
    diaChi: user?.diaChi || "",
    soDienThoai: user?.soDienThoai || "",
  });
  const [saved, setSaved] = useState(false);

  if (!user) { navigate("/login"); return null; }

  const myOrders = orders.filter((o) => o.userId === user.id || o.email === user.email);

  const handleSave = () => {
    updateProfile({ ...user, ...form });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const STATUS_MAP = {
    confirmed: { label: "Đã xác nhận", color: "#2b6cb0", bg: "#ebf8ff", icon: "✅" },
    shipping:  { label: "Đang giao",   color: "#92400e", bg: "#fffff0", icon: "🚚" },
    delivered: { label: "Đã giao",     color: "#276749", bg: "#f0fff4", icon: "📦" },
    cancelled: { label: "Đã hủy",      color: "#c53030", bg: "#fff5f5", icon: "❌" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.pageTitle}>👤 Hồ Sơ Của Tôi</h2>

        {saved && <div style={styles.successAlert}>✅ Cập nhật thông tin thành công!</div>}

        <div style={styles.layout}>
          {/* Profile Card */}
          <div style={styles.profileCard}>
            <div style={styles.avatarBox}>
              <div style={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
              <h3 style={styles.userName}>{user.name}</h3>
              <p style={styles.userEmail}>{user.email}</p>
              <span style={{
                ...styles.roleBadge,
                backgroundColor: user.role === "admin" ? "#fff5f5" : "#f0fff4",
                color: user.role === "admin" ? "#e53e3e" : "#276749",
              }}>
                {user.role === "admin" ? "👑 Admin" : "🛒 Khách hàng"}
              </span>
            </div>

            <div style={styles.infoList}>
              {[
                { icon: "📧", label: "Email", value: user.email },
                { icon: "🏷️", label: "Tên đăng nhập", value: user.tenDangNhap || "—" },
                { icon: "📞", label: "Số điện thoại", value: user.soDienThoai || "Chưa cập nhật" },
                { icon: "📍", label: "Địa chỉ", value: user.diaChi || "Chưa cập nhật" },
                { icon: "📅", label: "Ngày đăng ký", value: new Date(user.ngayDangKy).toLocaleDateString("vi-VN") },
              ].map((item, i) => (
                <div key={i} style={styles.infoRow}>
                  <span style={styles.infoIcon}>{item.icon}</span>
                  <div>
                    <p style={styles.infoLabel}>{item.label}</p>
                    <p style={styles.infoValue}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.profileActions}>
              <button style={styles.editProfileBtn} onClick={() => setEditing(true)}>
                ✏️ Chỉnh sửa thông tin
              </button>
              <button style={styles.logoutProfileBtn}
                onClick={() => { logout(); navigate("/"); }}>
                🚪 Đăng xuất
              </button>
            </div>
          </div>

          {/* Right side */}
          <div style={styles.rightCol}>
            {/* Stats */}
            <div style={styles.statsRow}>
              {[
                { icon: "📋", value: myOrders.length, label: "Tổng đơn hàng" },
                { icon: "📦", value: myOrders.filter((o) => o.status === "delivered").length, label: "Đã nhận" },
                { icon: "🚚", value: myOrders.filter((o) => o.status === "shipping").length, label: "Đang giao" },
              ].map((s, i) => (
                <div key={i} style={styles.statCard}>
                  <span style={{ fontSize: "28px" }}>{s.icon}</span>
                  <p style={styles.statValue}>{s.value}</p>
                  <p style={styles.statLabel}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            <div style={styles.ordersBox}>
              <div style={styles.ordersHeader}>
                <h3 style={styles.ordersTitle}>📋 Đơn hàng gần đây</h3>
                <button style={styles.viewAllBtn} onClick={() => navigate("/order")}>
                  Xem tất cả →
                </button>
              </div>
              {myOrders.length === 0 ? (
                <div style={styles.noOrders}>
                  <p style={{ fontSize: "40px" }}>🛒</p>
                  <p>Chưa có đơn hàng nào</p>
                  <button style={styles.shopBtn} onClick={() => navigate("/products")}>
                    Mua sắm ngay
                  </button>
                </div>
              ) : (
                myOrders.slice(0, 3).map((o) => {
                  const st = STATUS_MAP[o.status] || STATUS_MAP.confirmed;
                  return (
                    <div key={o.id} style={styles.orderRow}>
                      <div>
                        <p style={styles.orderId}>#{(o.id || "").slice(-8)}</p>
                        <p style={styles.orderDate}>
                          {new Date(o.date).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <span style={{ ...styles.statusBadge, color: st.color, backgroundColor: st.bg }}>
                        {st.icon} {st.label}
                      </span>
                      <span style={styles.orderTotal}>{o.total.toLocaleString("vi-VN")}đ</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>✏️ Chỉnh sửa thông tin</h2>
            {[
              { key: "name", label: "👤 Họ và tên", placeholder: "Nguyễn Văn A" },
              { key: "tenDangNhap", label: "🏷️ Tên đăng nhập", placeholder: "nguyenvana" },
              { key: "soDienThoai", label: "📞 Số điện thoại", placeholder: "0901234567" },
              { key: "diaChi", label: "📍 Địa chỉ", placeholder: "Số nhà, đường, quận, thành phố" },
            ].map((field) => (
              <div key={field.key} style={styles.modalField}>
                <label style={styles.modalLabel}>{field.label}</label>
                <input style={styles.modalInput} placeholder={field.placeholder}
                  value={form[field.key]} onChange={set(field.key)} />
              </div>
            ))}
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setEditing(false)}>Hủy</button>
              <button style={styles.saveBtn} onClick={handleSave}>💾 Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif" },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "32px 16px" },
  pageTitle: { fontSize: "26px", fontWeight: "800", color: "#2d3748", marginBottom: "24px" },
  successAlert: { backgroundColor: "#c6f6d5", color: "#276749", border: "1px solid #9ae6b4", borderRadius: "8px", padding: "12px 20px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" },
  layout: { display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" },

  profileCard: { width: "300px", flexShrink: 0, backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  avatarBox: { textAlign: "center", marginBottom: "24px", paddingBottom: "24px", borderBottom: "2px solid #f0f4f8" },
  avatar: { width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#38a169", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "28px", margin: "0 auto 12px" },
  userName: { fontSize: "18px", fontWeight: "700", color: "#2d3748", margin: "0 0 4px" },
  userEmail: { fontSize: "13px", color: "#718096", margin: "0 0 10px" },
  roleBadge: { fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px" },
  infoList: { display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" },
  infoRow: { display: "flex", alignItems: "flex-start", gap: "10px" },
  infoIcon: { fontSize: "16px", marginTop: "2px" },
  infoLabel: { fontSize: "11px", color: "#a0aec0", margin: "0 0 2px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
  infoValue: { fontSize: "14px", color: "#2d3748", fontWeight: "500", margin: 0 },
  profileActions: { display: "flex", flexDirection: "column", gap: "10px" },
  editProfileBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "11px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  logoutProfileBtn: { backgroundColor: "transparent", color: "#e53e3e", border: "2px solid #fed7d7", padding: "11px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },

  rightCol: { flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  statCard: { backgroundColor: "white", borderRadius: "12px", padding: "16px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  statValue: { fontSize: "24px", fontWeight: "800", color: "#2d3748", margin: "6px 0 4px" },
  statLabel: { fontSize: "12px", color: "#718096", margin: 0 },

  ordersBox: { backgroundColor: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  ordersHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  ordersTitle: { fontSize: "16px", fontWeight: "700", color: "#2d3748", margin: 0 },
  viewAllBtn: { backgroundColor: "transparent", color: "#38a169", border: "2px solid #38a169", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  noOrders: { textAlign: "center", padding: "32px", color: "#718096" },
  shopBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", marginTop: "12px" },
  orderRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: "#f7fafc", borderRadius: "8px", marginBottom: "8px" },
  orderId: { fontSize: "14px", fontWeight: "700", color: "#2d3748", margin: "0 0 2px", fontFamily: "monospace" },
  orderDate: { fontSize: "12px", color: "#718096", margin: 0 },
  statusBadge: { fontSize: "12px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px" },
  orderTotal: { fontSize: "15px", fontWeight: "700", color: "#e53e3e" },

  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  modal: { backgroundColor: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalTitle: { fontSize: "20px", fontWeight: "800", color: "#2d3748", marginBottom: "24px" },
  modalField: { marginBottom: "16px" },
  modalLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "6px" },
  modalInput: { width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  modalActions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" },
  cancelBtn: { padding: "10px 20px", backgroundColor: "#e2e8f0", color: "#4a5568", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  saveBtn: { padding: "10px 24px", backgroundColor: "#38a169", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "700" },
};

export default Profile;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (isRegister) {
      if (!name.trim()) { setError("Vui lòng nhập họ tên!"); return; }
      const ok = register(name, email, password);
      if (!ok) { setError("Email đã được sử dụng!"); return; }
    } else {
      const ok = login(email, password);
      if (!ok) { setError("Email hoặc mật khẩu không đúng!"); return; }
    }
    navigate("/");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={{ fontSize: "48px" }}>🛒</span>
          <h2 style={styles.logoText}>FoodMart</h2>
          <p style={styles.logoSub}>Siêu Thị Thực Phẩm Online</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(!isRegister ? styles.tabActive : {}) }}
            onClick={() => { setIsRegister(false); setError(""); }}
          >
            Đăng Nhập
          </button>
          <button
            style={{ ...styles.tab, ...(isRegister ? styles.tabActive : {}) }}
            onClick={() => { setIsRegister(true); setError(""); }}
          >
            Đăng Ký
          </button>
        </div>

        {/* Form */}
        <div style={styles.form}>
          {error && <div style={styles.error}>⚠️ {error}</div>}

          {isRegister && (
            <div style={styles.field}>
              <label style={styles.label}>👤 Họ và tên</label>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>📧 Email</label>
            <input
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>🔒 Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <button style={styles.submitBtn} onClick={handleSubmit}>
            {isRegister ? "✅ Đăng Ký" : "🔑 Đăng Nhập"}
          </button>

          <p style={styles.switchText}>
            {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
            <span
              style={styles.switchLink}
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
            >
              {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
            </span>
          </p>

          {/* Demo accounts */}
          {!isRegister && (
            <div style={styles.demoBox}>
              <p style={styles.demoTitle}>🧪 Tài khoản demo:</p>

              {/* Admin account */}
              <div style={styles.demoAccount}>
                <div style={styles.demoLeft}>
                  <span style={styles.adminTag}>👑 ADMIN</span>
                  <div>
                    <p style={styles.demoText}>admin@foodmart.vn</p>
                    <p style={styles.demoText}>Mật khẩu: admin123</p>
                  </div>
                </div>
                <button
                  style={styles.demoBtn}
                  onClick={() => {
                    setEmail("admin@foodmart.vn");
                    setPassword("admin123");
                  }}
                >
                  Dùng
                </button>
              </div>

              {/* User account */}
              <div style={styles.demoAccount}>
                <div style={styles.demoLeft}>
                  <span style={styles.userTag}>🛒 USER</span>
                  <div>
                    <p style={styles.demoText}>demo@foodmart.vn</p>
                    <p style={styles.demoText}>Mật khẩu: 123456</p>
                  </div>
                </div>
                <button
                  style={{ ...styles.demoBtn, backgroundColor: "#f6ad55" }}
                  onClick={() => {
                    setEmail("demo@foodmart.vn");
                    setPassword("123456");
                  }}
                >
                  Dùng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px" },
  card: { backgroundColor: "white", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "420px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" },
  logo: { textAlign: "center", marginBottom: "24px" },
  logoText: { fontSize: "28px", fontWeight: "800", color: "#2d3748", margin: "8px 0 4px" },
  logoSub: { fontSize: "13px", color: "#718096", margin: 0 },
  tabs: { display: "flex", backgroundColor: "#f7fafc", borderRadius: "10px", padding: "4px", marginBottom: "24px" },
  tab: { flex: 1, padding: "10px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", backgroundColor: "transparent", color: "#718096" },
  tabActive: { backgroundColor: "#38a169", color: "white", boxShadow: "0 2px 6px rgba(56,161,105,0.4)" },
  form: { display: "flex", flexDirection: "column", gap: "4px" },
  error: { backgroundColor: "#fff5f5", color: "#e53e3e", border: "1px solid #fed7d7", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", fontWeight: "600", marginBottom: "8px" },
  field: { marginBottom: "14px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "6px" },
  input: { width: "100%", padding: "12px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  submitBtn: { width: "100%", backgroundColor: "#38a169", color: "white", border: "none", padding: "14px", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", marginTop: "8px", boxShadow: "0 4px 12px rgba(56,161,105,0.4)" },
  switchText: { textAlign: "center", fontSize: "13px", color: "#718096", marginTop: "16px" },
  switchLink: { color: "#38a169", fontWeight: "700", cursor: "pointer" },
  demoBox: { backgroundColor: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", marginTop: "16px" },
  demoTitle: { fontSize: "13px", fontWeight: "700", color: "#4a5568", margin: "0 0 10px" },
  demoAccount: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", backgroundColor: "white", borderRadius: "8px", marginBottom: "8px", border: "1px solid #e2e8f0" },
  demoLeft: { display: "flex", alignItems: "center", gap: "10px" },
  adminTag: { backgroundColor: "#fff5f5", color: "#e53e3e", fontSize: "10px", fontWeight: "800", padding: "4px 8px", borderRadius: "6px", whiteSpace: "nowrap" },
  userTag: { backgroundColor: "#fffaf0", color: "#c05621", fontSize: "10px", fontWeight: "800", padding: "4px 8px", borderRadius: "6px", whiteSpace: "nowrap" },
  demoText: { fontSize: "12px", color: "#4a5568", margin: "1px 0" },
  demoBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
};

export default Login;
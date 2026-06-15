import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useVoucher } from "../context/VoucherContext";

const CATEGORY_COLORS = {
  welcome: { bg: "#f0fff4", border: "#68d391", color: "#276749" },
  shipping: { bg: "#ebf8ff", border: "#63b3ed", color: "#2b6cb0" },
  sale: { bg: "#fef3c7", border: "#f6d860", color: "#92400e" },
  vip: { bg: "#fff5f5", border: "#fc8181", color: "#c53030" },
  seasonal: { bg: "#fde8d8", border: "#f6ad55", color: "#c05621" },
  loyal: { bg: "#e9d8fd", border: "#b794f4", color: "#553c9a" },
};

function Voucher() {
  const { user } = useAuth();
  const {
    vouchers, loyaltyPrograms, userPoints, userSpend,
    getUserLevel, getUserVouchers, validateVoucher,
  } = useVoucher();
  const navigate = useNavigate();
  const [inputCode, setInputCode] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [copied, setCopied] = useState("");

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.loginBox}>
          <p style={{ fontSize: "48px" }}>🎫</p>
          <h2>Đăng nhập để xem voucher</h2>
          <button style={styles.loginBtn} onClick={() => navigate("/login")}>
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  const level = getUserLevel(user.id);
  const myPoints = userPoints[user.id] || 0;
  const mySpend = userSpend[user.id] || 0;
  const myVouchers = getUserVouchers(user.id);
  const nextLevel = loyaltyPrograms.find((lp) => lp.minSpend > mySpend);
  const progressToNext = nextLevel
    ? Math.min(((mySpend - level.minSpend) / (nextLevel.minSpend - level.minSpend)) * 100, 100)
    : 100;

  const handleCheck = () => {
    if (!inputCode.trim()) return;
    const result = validateVoucher(inputCode.trim().toUpperCase(), 999999999, user.id);
    setCheckResult(result);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  };

  const availableVouchers = vouchers.filter((v) => {
    if (!v.active) return false;
    if (activeTab === "all") return true;
    if (activeTab === "mine") {
      return myVouchers.some((uv) => uv.voucherId === v.id && !uv.used);
    }
    return v.category === activeTab;
  });

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>🎫 Voucher & Ưu Đãi</h1>
          <p style={styles.headerSub}>Khám phá các ưu đãi dành riêng cho bạn</p>
        </div>
      </div>

      <div style={styles.container}>
        {/* Membership Card */}
        <div style={{ ...styles.memberCard, background: `linear-gradient(135deg, ${level.color}, ${level.color}88)` }}>
          <div style={styles.memberLeft}>
            <div style={styles.memberTop}>
              <span style={styles.memberIcon}>{level.icon}</span>
              <div>
                <p style={styles.memberLabel}>Cấp độ thành viên</p>
                <h2 style={styles.memberName}>{level.name}</h2>
              </div>
            </div>
            <div style={styles.memberStats}>
              <div style={styles.memberStat}>
                <p style={styles.memberStatNum}>{myPoints.toLocaleString()}</p>
                <p style={styles.memberStatLabel}>Điểm tích lũy</p>
              </div>
              <div style={styles.memberStatDivider} />
              <div style={styles.memberStat}>
                <p style={styles.memberStatNum}>{mySpend.toLocaleString("vi-VN")}đ</p>
                <p style={styles.memberStatLabel}>Tổng chi tiêu</p>
              </div>
            </div>

            {nextLevel && (
              <div style={styles.progressSection}>
                <div style={styles.progressInfo}>
                  <span style={styles.progressLabel}>
                    Còn {(nextLevel.minSpend - mySpend).toLocaleString("vi-VN")}đ để lên {nextLevel.name}
                  </span>
                  <span style={styles.progressPct}>{Math.round(progressToNext)}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${progressToNext}%` }} />
                </div>
              </div>
            )}
          </div>

          <div style={styles.memberRight}>
            <p style={styles.memberUser}>{user.name}</p>
            <p style={styles.memberEmail}>{user.email}</p>
            <div style={styles.memberBenefits}>
              {level.benefits.slice(0, 3).map((b, i) => (
                <p key={i} style={styles.memberBenefit}>✓ {b}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Loyalty Programs */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🏆 Chương Trình Tri Ân</h2>
          <div style={styles.loyaltyGrid}>
            {loyaltyPrograms.map((lp) => {
              const isActive = lp.id === level.id;
              const isPassed = mySpend >= lp.minSpend;
              return (
                <div key={lp.id} style={{
                  ...styles.loyaltyCard,
                  border: isActive ? `3px solid ${lp.color}` : "2px solid #e2e8f0",
                  backgroundColor: isActive ? lp.bgColor : "white",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}>
                  {isActive && <div style={{ ...styles.activeTag, backgroundColor: lp.color }}>Cấp hiện tại</div>}
                  {isPassed && !isActive && <div style={styles.passedTag}>✓ Đã đạt</div>}
                  <div style={styles.loyaltyTop}>
                    <span style={{ fontSize: "36px" }}>{lp.icon}</span>
                    <div>
                      <h3 style={{ ...styles.loyaltyName, color: lp.color }}>{lp.name}</h3>
                      <p style={styles.loyaltySpend}>
                        Chi tiêu từ {lp.minSpend.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>
                  <div style={styles.loyaltyBenefits}>
                    {lp.benefits.map((b, i) => (
                      <p key={i} style={styles.loyaltyBenefit}>
                        <span style={{ color: lp.color }}>✓</span> {b}
                      </p>
                    ))}
                  </div>
                  <div style={{ ...styles.pointRate, backgroundColor: lp.bgColor, color: lp.color }}>
                    Tích {lp.pointRate}% điểm mỗi đơn
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Check voucher */}
        <div style={styles.checkBox}>
          <h3 style={styles.checkTitle}>🔍 Kiểm tra mã voucher</h3>
          <div style={styles.checkRow}>
            <input
              type="text"
              placeholder="Nhập mã voucher (VD: WELCOME50)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              style={styles.checkInput}
            />
            <button style={styles.checkBtn} onClick={handleCheck}>
              Kiểm tra
            </button>
          </div>
          {checkResult && (
            <div style={{
              ...styles.checkResult,
              backgroundColor: checkResult.valid ? "#f0fff4" : "#fff5f5",
              border: `1px solid ${checkResult.valid ? "#68d391" : "#fc8181"}`,
              color: checkResult.valid ? "#276749" : "#c53030",
            }}>
              {checkResult.valid ? "✅" : "❌"} {checkResult.message}
            </div>
          )}
        </div>

        {/* Vouchers */}
        <div style={styles.section}>
          <div style={styles.voucherHeader}>
            <h2 style={styles.sectionTitle}>🎟️ Kho Voucher</h2>
            <div style={styles.tabs}>
              {[
                { key: "all", label: "Tất cả" },
                { key: "mine", label: "Của tôi" },
                { key: "welcome", label: "Chào mừng" },
                { key: "shipping", label: "Giao hàng" },
                { key: "sale", label: "Giảm giá" },
                { key: "vip", label: "VIP" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {availableVouchers.length === 0 ? (
            <div style={styles.noVoucher}>
              <p style={{ fontSize: "48px" }}>🎫</p>
              <p>Không có voucher nào</p>
            </div>
          ) : (
            <div style={styles.voucherGrid}>
              {availableVouchers.map((voucher) => {
                const catStyle = CATEGORY_COLORS[voucher.category] || CATEGORY_COLORS.sale;
                const isUsed = myVouchers.some((uv) => uv.voucherId === voucher.id && uv.used);
                const isMine = myVouchers.some((uv) => uv.voucherId === voucher.id && !uv.used);
                const remaining = voucher.quantity - voucher.used;
                return (
                  <div key={voucher.id} style={{
                    ...styles.voucherCard,
                    opacity: isUsed ? 0.6 : 1,
                    border: `2px solid ${catStyle.border}`,
                  }}>
                    {/* Left strip */}
                    <div style={{ ...styles.voucherStrip, backgroundColor: catStyle.border }} />

                    {/* Content */}
                    <div style={styles.voucherContent}>
                      <div style={styles.voucherTop}>
                        <span style={{ fontSize: "32px" }}>{voucher.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={styles.voucherBadgeRow}>
                            <span style={{ ...styles.voucherBadge, backgroundColor: catStyle.bg, color: catStyle.color }}>
                              {voucher.category.toUpperCase()}
                            </span>
                            {isMine && <span style={styles.mineBadge}>✓ Của tôi</span>}
                            {isUsed && <span style={styles.usedBadge}>Đã dùng</span>}
                          </div>
                          <h3 style={styles.voucherName}>{voucher.name}</h3>
                          <p style={styles.voucherDesc}>{voucher.description}</p>
                        </div>
                      </div>

                      <div style={styles.voucherMeta}>
                        <div style={styles.voucherMetaItem}>
                          <span style={styles.metaLabel}>Đơn tối thiểu</span>
                          <span style={styles.metaValue}>{voucher.minOrder.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div style={styles.voucherMetaItem}>
                          <span style={styles.metaLabel}>Còn lại</span>
                          <span style={styles.metaValue}>{remaining} lượt</span>
                        </div>
                        <div style={styles.voucherMetaItem}>
                          <span style={styles.metaLabel}>HSD</span>
                          <span style={styles.metaValue}>{voucher.endDate}</span>
                        </div>
                      </div>

                      <div style={styles.voucherBottom}>
                        <div style={styles.voucherCodeBox}>
                          <span style={styles.voucherCode}>{voucher.code}</span>
                          <button
                            style={styles.copyBtn}
                            onClick={() => handleCopy(voucher.code)}
                          >
                            {copied === voucher.code ? "✓ Đã copy" : "📋 Copy"}
                          </button>
                        </div>
                        <div style={{ ...styles.discountTag, backgroundColor: catStyle.bg, color: catStyle.color }}>
                          {voucher.type === "percent" && `Giảm ${voucher.value}%`}
                          {voucher.type === "fixed" && `Giảm ${voucher.value.toLocaleString("vi-VN")}đ`}
                          {voucher.type === "shipping" && "Miễn ship"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* How to use */}
        <div style={styles.howToBox}>
          <h2 style={styles.sectionTitle}>📖 Hướng Dẫn Sử Dụng</h2>
          <div style={styles.howToGrid}>
            {[
              { icon: "🛒", step: "1", title: "Thêm sản phẩm", desc: "Chọn sản phẩm và thêm vào giỏ hàng" },
              { icon: "🎫", step: "2", title: "Nhập mã voucher", desc: "Nhập mã voucher tại trang thanh toán" },
              { icon: "✅", step: "3", title: "Xác nhận giảm giá", desc: "Hệ thống tự động tính giảm giá" },
              { icon: "📦", step: "4", title: "Đặt hàng thành công", desc: "Hoàn tất đơn hàng và nhận hàng" },
            ].map((item, i) => (
              <div key={i} style={styles.howToCard}>
                <div style={styles.howToStep}>{item.step}</div>
                <span style={{ fontSize: "32px" }}>{item.icon}</span>
                <h3 style={styles.howToTitle}>{item.title}</h3>
                <p style={styles.howToDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif" },
  loginBox: { textAlign: "center", padding: "80px" },
  loginBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "12px 28px", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "600", marginTop: "16px" },
  header: { background: "linear-gradient(135deg, #1a4731, #276749, #38a169)", padding: "48px 32px" },
  headerContent: { maxWidth: "1200px", margin: "0 auto", textAlign: "center" },
  headerTitle: { fontSize: "40px", fontWeight: "900", color: "white", margin: "0 0 8px" },
  headerSub: { fontSize: "16px", color: "#c6f6d5", margin: 0 },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" },

  // Member card
  memberCard: { borderRadius: "20px", padding: "32px", display: "flex", gap: "32px", marginBottom: "40px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", color: "white", flexWrap: "wrap" },
  memberLeft: { flex: 1, minWidth: "280px" },
  memberTop: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  memberIcon: { fontSize: "48px" },
  memberLabel: { fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: "0 0 4px", fontWeight: "600", letterSpacing: "1px" },
  memberName: { fontSize: "24px", fontWeight: "800", margin: 0 },
  memberStats: { display: "flex", alignItems: "center", gap: "24px", marginBottom: "20px" },
  memberStat: { textAlign: "center" },
  memberStatNum: { fontSize: "22px", fontWeight: "800", margin: "0 0 4px" },
  memberStatLabel: { fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: 0 },
  memberStatDivider: { width: "1px", height: "40px", backgroundColor: "rgba(255,255,255,0.3)" },
  progressSection: { marginTop: "8px" },
  progressInfo: { display: "flex", justifyContent: "space-between", marginBottom: "6px" },
  progressLabel: { fontSize: "12px", color: "rgba(255,255,255,0.9)" },
  progressPct: { fontSize: "12px", fontWeight: "700" },
  progressBar: { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: "10px", height: "8px", overflow: "hidden" },
  progressFill: { backgroundColor: "white", height: "100%", borderRadius: "10px", transition: "width 0.5s" },
  memberRight: { flex: 1, minWidth: "200px" },
  memberUser: { fontSize: "20px", fontWeight: "700", margin: "0 0 4px" },
  memberEmail: { fontSize: "13px", color: "rgba(255,255,255,0.8)", margin: "0 0 16px" },
  memberBenefits: { display: "flex", flexDirection: "column", gap: "6px" },
  memberBenefit: { fontSize: "13px", color: "rgba(255,255,255,0.9)", margin: 0 },

  // Section
  section: { marginBottom: "48px" },
  sectionTitle: { fontSize: "22px", fontWeight: "800", color: "#2d3748", marginBottom: "20px" },

  // Loyalty
  loyaltyGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
  loyaltyCard: { borderRadius: "16px", padding: "20px", position: "relative", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  activeTag: { position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", color: "white", fontSize: "11px", fontWeight: "700", padding: "3px 12px", borderRadius: "20px", whiteSpace: "nowrap" },
  passedTag: { position: "absolute", top: "10px", right: "10px", backgroundColor: "#f0fff4", color: "#276749", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px" },
  loyaltyTop: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" },
  loyaltyName: { fontSize: "16px", fontWeight: "700", margin: "0 0 4px" },
  loyaltySpend: { fontSize: "12px", color: "#718096", margin: 0 },
  loyaltyBenefits: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" },
  loyaltyBenefit: { fontSize: "12px", color: "#4a5568", margin: 0 },
  pointRate: { fontSize: "12px", fontWeight: "700", padding: "6px 10px", borderRadius: "8px", textAlign: "center" },

  // Check box
  checkBox: { backgroundColor: "white", borderRadius: "16px", padding: "24px", marginBottom: "40px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  checkTitle: { fontSize: "18px", fontWeight: "700", color: "#2d3748", marginBottom: "14px" },
  checkRow: { display: "flex", gap: "10px" },
  checkInput: { flex: 1, padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none", letterSpacing: "1px", fontWeight: "600" },
  checkBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "12px 24px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "700" },
  checkResult: { marginTop: "12px", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "600" },

  // Vouchers
  voucherHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  tabs: { display: "flex", gap: "6px", flexWrap: "wrap" },
  tab: { padding: "7px 14px", border: "2px solid #e2e8f0", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "600", backgroundColor: "white", color: "#718096" },
  tabActive: { backgroundColor: "#38a169", color: "white", borderColor: "#38a169" },
  noVoucher: { textAlign: "center", padding: "60px", color: "#718096", backgroundColor: "white", borderRadius: "12px" },
  voucherGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" },
  voucherCard: { backgroundColor: "white", borderRadius: "14px", display: "flex", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  voucherStrip: { width: "6px", flexShrink: 0 },
  voucherContent: { flex: 1, padding: "16px 18px" },
  voucherTop: { display: "flex", gap: "12px", marginBottom: "12px" },
  voucherBadgeRow: { display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" },
  voucherBadge: { fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "6px", letterSpacing: "0.5px" },
  mineBadge: { fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", backgroundColor: "#f0fff4", color: "#276749" },
  usedBadge: { fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", backgroundColor: "#f7fafc", color: "#a0aec0" },
  voucherName: { fontSize: "15px", fontWeight: "700", color: "#2d3748", margin: "0 0 4px" },
  voucherDesc: { fontSize: "12px", color: "#718096", margin: 0 },
  voucherMeta: { display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap" },
  voucherMetaItem: { display: "flex", flexDirection: "column", gap: "2px" },
  metaLabel: { fontSize: "10px", color: "#a0aec0", fontWeight: "700", textTransform: "uppercase" },
  metaValue: { fontSize: "12px", color: "#2d3748", fontWeight: "600" },
  voucherBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  voucherCodeBox: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f7fafc", borderRadius: "8px", padding: "8px 12px", border: "1px dashed #cbd5e0" },
  voucherCode: { fontSize: "15px", fontWeight: "800", color: "#2d3748", letterSpacing: "1px", fontFamily: "monospace" },
  copyBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700" },
  discountTag: { fontSize: "13px", fontWeight: "800", padding: "6px 12px", borderRadius: "8px" },

  // How to
  howToBox: { backgroundColor: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  howToGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
  howToCard: { textAlign: "center", padding: "20px" },
  howToStep: { width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#38a169", color: "white", fontWeight: "800", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" },
  howToTitle: { fontSize: "15px", fontWeight: "700", color: "#2d3748", margin: "8px 0 6px" },
  howToDesc: { fontSize: "13px", color: "#718096", margin: 0 },
};

export default Voucher;
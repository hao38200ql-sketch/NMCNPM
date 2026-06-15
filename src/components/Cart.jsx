import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cartItems, deleteItem, updateQuantity } = useCart();
  const navigate = useNavigate();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total >= 200000 ? 0 : 30000;
  const grand = total + shipping;
  const progress = Math.min((total / 200000) * 100, 100);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div style={styles.pageHeaderContent}>
          <h1 style={styles.pageTitle}>🛒 Giỏ Hàng Của Bạn</h1>
          <p style={styles.pageSubtitle}>{cartItems.length} loại sản phẩm</p>
        </div>
      </div>

      <div style={styles.container}>
        {cartItems.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "80px", margin: 0 }}>🛒</p>
            <h3 style={styles.emptyTitle}>Giỏ hàng trống</h3>
            <p style={styles.emptySub}>Hãy thêm sản phẩm vào giỏ hàng nhé!</p>
            <button style={styles.shopBtn} onClick={() => navigate("/products")}>
              🏪 Bắt đầu mua sắm
            </button>
          </div>
        ) : (
          <div style={styles.layout}>
            {/* Items */}
            <div style={styles.cartList}>
              {/* Free ship progress */}
              {total < 200000 && (
                <div style={styles.progressBox}>
                  <p style={styles.progressText}>
                    🚚 Mua thêm <strong>{(200000 - total).toLocaleString("vi-VN")}đ</strong> để được miễn phí giao hàng!
                  </p>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {cartItems.map((item) => (
                <div key={item.id} style={styles.cartItem}>
                  <img src={item.image} alt={item.title} style={styles.itemImg}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/90"; }} />
                  <div style={styles.itemInfo}>
                    <p style={styles.itemCat}>{item.category.replace("-", " ").toUpperCase()}</p>
                    <h3 style={styles.itemName}>{item.title}</h3>
                    <p style={styles.itemPrice}>{item.price.toLocaleString("vi-VN")}đ / sp</p>
                  </div>
                  <div style={styles.itemRight}>
                    <div style={styles.qtyControl}>
                      <button style={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span style={styles.qtyNum}>{item.quantity}</span>
                      <button style={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <p style={styles.subtotal}>
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                    <button style={styles.deleteBtn} onClick={() => deleteItem(item.id)}>
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={styles.summary}>
              <h3 style={styles.summaryTitle}>📋 Tóm tắt đơn hàng</h3>

              <div style={styles.summaryRows}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Số lượng</span>
                  <span style={styles.summaryVal}>{cartItems.reduce((s, i) => s + i.quantity, 0)} sp</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Tạm tính</span>
                  <span style={styles.summaryVal}>{total.toLocaleString("vi-VN")}đ</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Phí giao hàng</span>
                  <span style={{ ...styles.summaryVal, color: "#38a169", fontWeight: "700" }}>
                    {shipping === 0 ? "🎉 Miễn phí" : `${shipping.toLocaleString("vi-VN")}đ`}
                  </span>
                </div>
              </div>

              <div style={styles.totalBox}>
                <span style={styles.totalLabel}>Tổng cộng</span>
                <span style={styles.totalPrice}>{grand.toLocaleString("vi-VN")}đ</span>
              </div>

              <button style={styles.checkoutBtn} onClick={() => navigate("/checkout")}>
                💳 Tiến hành thanh toán
              </button>
              <button style={styles.continueBtn} onClick={() => navigate("/products")}>
                ← Tiếp tục mua sắm
              </button>

              <div style={styles.secureBox}>
                <span>🔒</span>
                <span style={styles.secureText}>Thanh toán an toàn & bảo mật</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif" },
  pageHeader: { background: "linear-gradient(135deg, #2d3748, #4a5568)", padding: "32px" },
  pageHeaderContent: { maxWidth: "1100px", margin: "0 auto" },
  pageTitle: { fontSize: "28px", fontWeight: "800", color: "white", margin: "0 0 6px" },
  pageSubtitle: { fontSize: "14px", color: "#a0aec0", margin: 0 },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "32px 16px" },
  empty: { textAlign: "center", padding: "80px", backgroundColor: "white", borderRadius: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  emptyTitle: { fontSize: "22px", fontWeight: "700", color: "#2d3748", margin: "16px 0 8px" },
  emptySub: { color: "#718096", fontSize: "15px", margin: "0 0 24px" },
  shopBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "14px 32px", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "700" },
  layout: { display: "flex", gap: "24px", alignItems: "flex-start" },
  cartList: { flex: 1, display: "flex", flexDirection: "column", gap: "12px" },

  progressBox: { backgroundColor: "white", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  progressText: { fontSize: "13px", color: "#4a5568", margin: "0 0 10px" },
  progressBar: { backgroundColor: "#e2e8f0", borderRadius: "10px", height: "8px", overflow: "hidden" },
  progressFill: { backgroundColor: "#38a169", height: "100%", borderRadius: "10px", transition: "width 0.3s" },

  cartItem: { backgroundColor: "white", borderRadius: "14px", padding: "16px 20px", display: "flex", gap: "16px", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  itemImg: { width: "90px", height: "90px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemCat: { fontSize: "10px", color: "#38a169", fontWeight: "800", margin: "0 0 4px", letterSpacing: "1px" },
  itemName: { fontSize: "15px", fontWeight: "600", color: "#2d3748", margin: "0 0 6px" },
  itemPrice: { fontSize: "13px", color: "#718096", margin: 0 },
  itemRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" },
  qtyControl: { display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#f7fafc", border: "2px solid #e2e8f0", borderRadius: "10px", padding: "4px 8px" },
  qtyBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#38a169", fontWeight: "800", width: "28px", height: "28px", borderRadius: "6px" },
  qtyNum: { fontSize: "15px", fontWeight: "800", minWidth: "28px", textAlign: "center", color: "#2d3748" },
  subtotal: { fontSize: "17px", fontWeight: "800", color: "#e53e3e", margin: 0 },
  deleteBtn: { background: "none", border: "none", color: "#fc8181", cursor: "pointer", fontSize: "13px", fontWeight: "600" },

  summary: { width: "320px", flexShrink: 0, backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", position: "sticky", top: "80px" },
  summaryTitle: { fontSize: "18px", fontWeight: "800", color: "#2d3748", marginBottom: "20px", paddingBottom: "16px", borderBottom: "2px solid #f0f4f8" },
  summaryRows: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: "14px", color: "#718096" },
  summaryVal: { fontSize: "14px", color: "#2d3748", fontWeight: "600" },
  totalBox: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f0fff4", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px" },
  totalLabel: { fontSize: "16px", fontWeight: "700", color: "#2d3748" },
  totalPrice: { fontSize: "22px", fontWeight: "900", color: "#e53e3e" },
  checkoutBtn: { width: "100%", backgroundColor: "#e53e3e", color: "white", border: "none", padding: "15px", borderRadius: "10px", fontSize: "15px", fontWeight: "800", cursor: "pointer", marginBottom: "10px", boxShadow: "0 4px 12px rgba(229,62,62,0.3)" },
  continueBtn: { width: "100%", backgroundColor: "transparent", color: "#38a169", border: "2px solid #38a169", padding: "13px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "16px" },
  secureBox: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#a0aec0", fontSize: "12px" },
  secureText: { fontWeight: "500" },
};

export default Cart;
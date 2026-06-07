import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cartItems, deleteItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.pageTitle}>🛒 Giỏ Hàng Của Bạn</h2>

        {cartItems.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "64px" }}>🛒</p>
            <p style={{ fontSize: "18px", fontWeight: "600", color: "#2d3748" }}>Giỏ hàng trống</p>
            <p style={{ color: "#718096" }}>Hãy thêm sản phẩm vào giỏ hàng</p>
            <button style={styles.shopBtn} onClick={() => navigate("/products")}>
              🏪 Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div style={styles.layout}>
            {/* Cart Items */}
            <div style={styles.cartList}>
              {cartItems.map((item) => (
                <div key={item.id} style={styles.cartItem}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={styles.itemImg}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/80"; }}
                  />
                  <div style={styles.itemInfo}>
                    <p style={styles.itemCategory}>{item.category.replace("-", " ").toUpperCase()}</p>
                    <h3 style={styles.itemName}>{item.title}</h3>
                    <p style={styles.itemPrice}>{item.price.toLocaleString("vi-VN")}đ / sp</p>
                  </div>
                  <div style={styles.itemControls}>
                    <div style={styles.qtyControl}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >−</button>
                      <span style={styles.qtyNum}>{item.quantity}</span>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >+</button>
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

            {/* Order Summary */}
            <div style={styles.summary}>
              <h3 style={styles.summaryTitle}>📋 Tóm tắt đơn hàng</h3>
              <div style={styles.summaryRow}>
                <span>Số sản phẩm:</span>
                <span>{cartItems.reduce((s, i) => s + i.quantity, 0)} sp</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Tạm tính:</span>
                <span>{total.toLocaleString("vi-VN")}đ</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Phí giao hàng:</span>
                <span style={{ color: "#38a169" }}>{total >= 200000 ? "Miễn phí" : "30.000đ"}</span>
              </div>
              <div style={styles.divider} />
              <div style={styles.totalRow}>
                <span>Tổng cộng:</span>
                <span style={styles.totalPrice}>
                  {(total >= 200000 ? total : total + 30000).toLocaleString("vi-VN")}đ
                </span>
              </div>
              {total < 200000 && (
                <p style={styles.freeShipNote}>
                  Mua thêm {(200000 - total).toLocaleString("vi-VN")}đ để được miễn phí giao hàng!
                </p>
              )}
              <button style={styles.checkoutBtn} onClick={() => navigate("/checkout")}>
                💳 Tiến hành thanh toán
              </button>
              <button style={styles.continueBtn} onClick={() => navigate("/products")}>
                ← Tiếp tục mua sắm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif" },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "32px 16px" },
  pageTitle: { fontSize: "26px", fontWeight: "800", color: "#2d3748", marginBottom: "24px" },
  empty: { textAlign: "center", padding: "80px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  shopBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "12px 28px", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "600", marginTop: "16px" },
  layout: { display: "flex", gap: "24px", alignItems: "flex-start" },
  cartList: { flex: 1, display: "flex", flexDirection: "column", gap: "12px" },
  cartItem: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  itemImg: { width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemCategory: { fontSize: "10px", color: "#38a169", fontWeight: "700", margin: "0 0 4px" },
  itemName: { fontSize: "15px", fontWeight: "600", color: "#2d3748", margin: "0 0 6px" },
  itemPrice: { fontSize: "13px", color: "#718096", margin: 0 },
  itemControls: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" },
  qtyControl: { display: "flex", alignItems: "center", gap: "8px", border: "2px solid #e2e8f0", borderRadius: "8px", padding: "4px" },
  qtyBtn: { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#38a169", fontWeight: "700", width: "28px", height: "28px" },
  qtyNum: { fontSize: "15px", fontWeight: "700", minWidth: "24px", textAlign: "center", color: "#2d3748" },
  subtotal: { fontSize: "16px", fontWeight: "700", color: "#e53e3e", margin: 0 },
  deleteBtn: { background: "none", border: "none", color: "#fc8181", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  summary: {
    width: "300px",
    flexShrink: 0,
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  summaryTitle: { fontSize: "18px", fontWeight: "700", color: "#2d3748", marginBottom: "16px" },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#4a5568", marginBottom: "10px" },
  divider: { borderTop: "2px solid #e2e8f0", margin: "16px 0" },
  totalRow: { display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "700", color: "#2d3748", marginBottom: "8px" },
  totalPrice: { color: "#e53e3e", fontSize: "20px" },
  freeShipNote: { fontSize: "12px", color: "#f6ad55", fontWeight: "600", textAlign: "center", backgroundColor: "#fffaf0", padding: "8px", borderRadius: "6px", marginBottom: "12px" },
  checkoutBtn: { width: "100%", backgroundColor: "#e53e3e", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginBottom: "10px" },
  continueBtn: { width: "100%", backgroundColor: "transparent", color: "#38a169", border: "2px solid #38a169", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
};

export default Cart;
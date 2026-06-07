import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";

function Checkout() {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const { cartItems, clearCart } = useCart();
  const { addOrder } = useOrder();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total >= 200000 ? 0 : 30000;

  const handleConfirm = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    const id = addOrder({ cartItems, total, shipping, name, phone, address, note });
    setOrderId(id);
    clearCart();
    setSuccess(true);
  };

  if (success) return (
    <div style={styles.successPage}>
      <div style={styles.successBox}>
        <p style={{ fontSize: "64px" }}>✅</p>
        <h2 style={styles.successTitle}>Đặt hàng thành công!</h2>
        <div style={styles.orderIdBadge}>
          <span style={styles.orderIdLabel}>Mã đơn hàng</span>
          <span style={styles.orderIdValue}>{orderId}</span>
        </div>
        <p style={styles.successText}>Cảm ơn bạn đã mua sắm tại FoodMart.</p>
        <p style={styles.successText}>Đơn hàng sẽ được giao trong 2-4 giờ.</p>
        <div style={styles.successBtns}>
          <button style={styles.viewOrderBtn} onClick={() => navigate("/order")}>
            📋 Xem lịch sử đơn hàng
          </button>
          <button style={styles.homeBtn} onClick={() => navigate("/")}>
            🏠 Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.pageTitle}>💳 Thanh Toán</h2>

        <div style={styles.layout}>
          {/* Form */}
          <div style={styles.formBox}>
            <h3 style={styles.formTitle}>📦 Thông tin giao hàng</h3>

            <div style={styles.field}>
              <label style={styles.label}>Họ và tên *</label>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Số điện thoại *</label>
              <input
                type="text"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Địa chỉ giao hàng *</label>
              <textarea
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={styles.textarea}
                rows={3}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Ghi chú</label>
              <input
                type="text"
                placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.paymentMethod}>
              <h3 style={styles.formTitle}>💵 Phương thức thanh toán</h3>
              <div style={styles.methodOption}>
                <input type="radio" defaultChecked id="cod" />
                <label htmlFor="cod" style={styles.methodLabel}>
                  💵 Thanh toán khi nhận hàng (COD)
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div style={styles.summary}>
            <h3 style={styles.summaryTitle}>🧾 Đơn hàng của bạn</h3>
            <div style={styles.orderList}>
              {cartItems.map((item) => (
                <div key={item.id} style={styles.orderItem}>
                  <img src={item.image} alt={item.title} style={styles.orderImg}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }} />
                  <div style={{ flex: 1 }}>
                    <p style={styles.orderName}>{item.title}</p>
                    <p style={styles.orderQty}>x{item.quantity}</p>
                  </div>
                  <span style={styles.orderPrice}>
                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ))}
            </div>
            <div style={styles.divider} />
            <div style={styles.summaryRow}>
              <span>Tạm tính:</span>
              <span>{total.toLocaleString("vi-VN")}đ</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Phí giao hàng:</span>
              <span style={{ color: "#38a169" }}>{shipping === 0 ? "Miễn phí" : "30.000đ"}</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.totalRow}>
              <span>Tổng cộng:</span>
              <span style={styles.totalPrice}>{(total + shipping).toLocaleString("vi-VN")}đ</span>
            </div>
            <button style={styles.confirmBtn} onClick={handleConfirm}>
              ✅ Xác nhận đặt hàng
            </button>
            <button style={styles.backBtn} onClick={() => navigate("/cart")}>
              ← Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif" },
  container: { maxWidth: "1000px", margin: "0 auto", padding: "32px 16px" },
  pageTitle: { fontSize: "26px", fontWeight: "800", color: "#2d3748", marginBottom: "24px" },
  layout: { display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" },
  formBox: { flex: 1, minWidth: "300px", backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  formTitle: { fontSize: "16px", fontWeight: "700", color: "#2d3748", marginBottom: "16px" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "6px" },
  input: { width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "sans-serif", boxSizing: "border-box" },
  paymentMethod: { marginTop: "24px", paddingTop: "20px", borderTop: "2px solid #e2e8f0" },
  methodOption: { display: "flex", alignItems: "center", gap: "10px", padding: "12px", backgroundColor: "#f0fff4", borderRadius: "8px", border: "2px solid #9ae6b4" },
  methodLabel: { fontSize: "14px", fontWeight: "600", color: "#276749", cursor: "pointer" },
  summary: { width: "320px", flexShrink: 0, backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  summaryTitle: { fontSize: "18px", fontWeight: "700", color: "#2d3748", marginBottom: "16px" },
  orderList: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" },
  orderItem: { display: "flex", alignItems: "center", gap: "10px" },
  orderImg: { width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 },
  orderName: { fontSize: "13px", fontWeight: "600", color: "#2d3748", margin: 0 },
  orderQty: { fontSize: "12px", color: "#718096", margin: 0 },
  orderPrice: { fontSize: "13px", fontWeight: "700", color: "#e53e3e", whiteSpace: "nowrap" },
  divider: { borderTop: "2px solid #e2e8f0", margin: "12px 0" },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#4a5568", marginBottom: "8px" },
  totalRow: { display: "flex", justifyContent: "space-between", fontWeight: "700", color: "#2d3748", marginBottom: "16px" },
  totalPrice: { color: "#e53e3e", fontSize: "20px" },
  confirmBtn: { width: "100%", backgroundColor: "#38a169", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginBottom: "10px" },
  backBtn: { width: "100%", backgroundColor: "transparent", color: "#718096", border: "2px solid #e2e8f0", padding: "12px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" },

  /* Success */
  successPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0fff4", fontFamily: "sans-serif" },
  successBox: { textAlign: "center", backgroundColor: "white", borderRadius: "20px", padding: "48px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", maxWidth: "420px", width: "90%" },
  successTitle: { fontSize: "28px", fontWeight: "800", color: "#276749", margin: "0 0 20px" },
  orderIdBadge: { display: "inline-flex", flexDirection: "column", alignItems: "center", backgroundColor: "#f0fff4", border: "2px dashed #68d391", borderRadius: "12px", padding: "12px 24px", marginBottom: "20px" },
  orderIdLabel: { fontSize: "11px", color: "#38a169", fontWeight: "700", letterSpacing: "1px", marginBottom: "4px" },
  orderIdValue: { fontSize: "18px", fontWeight: "800", color: "#2d3748", letterSpacing: "1px" },
  successText: { color: "#4a5568", fontSize: "15px", margin: "0 0 8px" },
  successBtns: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" },
  viewOrderBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "13px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  homeBtn: { backgroundColor: "transparent", color: "#718096", border: "2px solid #e2e8f0", padding: "11px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" },
};

export default Checkout;

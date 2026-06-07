import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "../context/OrderContext";

const STATUS = {
  confirmed: { label: "Đã xác nhận", color: "#3182ce", bg: "#ebf8ff", icon: "✅" },
  shipping:  { label: "Đang giao",   color: "#d69e2e", bg: "#fffff0", icon: "🚚" },
  delivered: { label: "Đã nhận",     color: "#38a169", bg: "#f0fff4", icon: "📦" },
};

function Order() {
  const { order } = useOrder();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  if (order.length === 0) return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.pageTitle}>📋 Lịch Sử Đơn Hàng</h2>
        <div style={styles.empty}>
          <p style={{ fontSize: "64px", margin: 0 }}>🛍️</p>
          <p style={styles.emptyTitle}>Bạn chưa có đơn hàng nào</p>
          <p style={styles.emptyText}>Hãy mua sắm và đơn hàng sẽ hiện ở đây!</p>
          <button style={styles.shopBtn} onClick={() => navigate("/products")}>
            🏪 Bắt đầu mua sắm
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.pageTitle}>📋 Lịch Sử Đơn Hàng</h2>
          <span style={styles.orderCount}>{order.length} đơn hàng</span>
        </div>

        <div style={styles.list}>
          {order.map((order) => {
            const st = STATUS[order.status];
            const isOpen = expanded === order.id;

            return (
              <div key={order.id} style={styles.card}>
                {/* Card Header */}
                <div style={styles.cardHeader} onClick={() => toggle(order.id)}>
                  <div style={styles.cardLeft}>
                    <div style={styles.orderMeta}>
                      <span style={styles.orderId}>#{order.id}</span>
                      <span style={{ ...styles.statusBadge, color: st.color, backgroundColor: st.bg }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <p style={styles.orderDate}>
                      🕐 {new Date(order.date).toLocaleString("vi-VN")}
                    </p>
                    <p style={styles.orderAddr}>📍 {order.address}</p>
                  </div>

                  <div style={styles.cardRight}>
                    <p style={styles.totalLabel}>Tổng tiền</p>
                    <p style={styles.totalAmount}>{order.total.toLocaleString("vi-VN")}đ</p>
                    <p style={styles.itemCount}>{order.items.reduce((s, i) => s + i.quantity, 0)} sản phẩm</p>
                    <span style={styles.chevron}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Expandable Detail */}
                {isOpen && (
                  <div style={styles.cardDetail}>
                    {/* Delivery info */}
                    <div style={styles.infoGrid}>
                      <div style={styles.infoBox}>
                        <p style={styles.infoLabel}>👤 Người nhận</p>
                        <p style={styles.infoValue}>{order.name}</p>
                      </div>
                      <div style={styles.infoBox}>
                        <p style={styles.infoLabel}>📞 Điện thoại</p>
                        <p style={styles.infoValue}>{order.phone}</p>
                      </div>
                      <div style={styles.infoBox}>
                        <p style={styles.infoLabel}>💳 Thanh toán</p>
                        <p style={styles.infoValue}>COD (khi nhận hàng)</p>
                      </div>
                      {order.note && (
                        <div style={styles.infoBox}>
                          <p style={styles.infoLabel}>📝 Ghi chú</p>
                          <p style={styles.infoValue}>{order.note}</p>
                        </div>
                      )}
                    </div>

                    <div style={styles.detailDivider} />

                    {/* Items */}
                    <p style={styles.itemsTitle}>🛒 Sản phẩm đã mua</p>
                    <div style={styles.itemList}>
                      {order.items.map((item, i) => (
                        <div key={i} style={styles.item}>
                          <img
                            src={item.image}
                            alt={item.title}
                            style={styles.itemImg}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/56"; }}
                          />
                          <div style={styles.itemInfo}>
                            <p style={styles.itemCategory}>
                              {item.category.replace("-", " ").toUpperCase()}
                            </p>
                            <p style={styles.itemName}>{item.title}</p>
                            <p style={styles.itemUnit}>{item.price.toLocaleString("vi-VN")}đ / sp</p>
                          </div>
                          <div style={styles.itemRight}>
                            <span style={styles.itemQty}>x{item.quantity}</span>
                            <span style={styles.itemSubtotal}>
                              {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={styles.detailDivider} />

                    {/* Price summary */}
                    <div style={styles.priceSummary}>
                      <div style={styles.priceRow}>
                        <span style={styles.priceLabel}>Tạm tính</span>
                        <span style={styles.priceValue}>{order.subtotal.toLocaleString("vi-VN")}đ</span>
                      </div>
                      <div style={styles.priceRow}>
                        <span style={styles.priceLabel}>Phí giao hàng</span>
                        <span style={{ ...styles.priceValue, color: "#38a169" }}>
                          {order.shipping === 0 ? "Miễn phí" : `${order.shipping.toLocaleString("vi-VN")}đ`}
                        </span>
                      </div>
                      <div style={{ ...styles.priceRow, ...styles.priceTotalRow }}>
                        <span style={styles.priceTotalLabel}>Tổng cộng</span>
                        <span style={styles.priceTotalValue}>{order.total.toLocaleString("vi-VN")}đ</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.footer}>
          <button style={styles.continueBtn} onClick={() => navigate("/products")}>
            ← Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif" },
  container: { maxWidth: "860px", margin: "0 auto", padding: "32px 16px" },
  header: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" },
  pageTitle: { fontSize: "26px", fontWeight: "800", color: "#2d3748", margin: 0 },
  orderCount: { backgroundColor: "#38a169", color: "white", fontSize: "13px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" },

  empty: { textAlign: "center", backgroundColor: "white", borderRadius: "16px", padding: "80px 40px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#2d3748", margin: "16px 0 8px" },
  emptyText: { color: "#718096", fontSize: "14px", margin: "0 0 24px" },
  shopBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "12px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },

  list: { display: "flex", flexDirection: "column", gap: "14px" },

  card: { backgroundColor: "white", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px 24px",
    cursor: "pointer",
    gap: "16px",
  },
  cardLeft: { flex: 1 },
  orderMeta: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" },
  orderId: { fontSize: "15px", fontWeight: "800", color: "#2d3748", fontFamily: "monospace" },
  statusBadge: { fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" },
  orderDate: { fontSize: "13px", color: "#718096", margin: "0 0 4px" },
  orderAddr: { fontSize: "13px", color: "#4a5568", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "380px" },

  cardRight: { textAlign: "right", flexShrink: 0 },
  totalLabel: { fontSize: "11px", color: "#718096", margin: "0 0 4px" },
  totalAmount: { fontSize: "20px", fontWeight: "800", color: "#e53e3e", margin: "0 0 4px" },
  itemCount: { fontSize: "12px", color: "#a0aec0", margin: "0 0 6px" },
  chevron: { fontSize: "12px", color: "#a0aec0" },

  cardDetail: { borderTop: "2px solid #f0f4f8", padding: "20px 24px", backgroundColor: "#fafcff" },

  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" },
  infoBox: { backgroundColor: "white", borderRadius: "8px", padding: "10px 14px", border: "1px solid #e2e8f0" },
  infoLabel: { fontSize: "11px", color: "#a0aec0", fontWeight: "700", letterSpacing: "0.5px", margin: "0 0 4px", textTransform: "uppercase" },
  infoValue: { fontSize: "14px", color: "#2d3748", fontWeight: "600", margin: 0 },

  detailDivider: { borderTop: "1px solid #e2e8f0", margin: "16px 0" },

  itemsTitle: { fontSize: "14px", fontWeight: "700", color: "#4a5568", marginBottom: "12px" },
  itemList: { display: "flex", flexDirection: "column", gap: "10px" },
  item: { display: "flex", alignItems: "center", gap: "12px", backgroundColor: "white", borderRadius: "10px", padding: "10px 14px", border: "1px solid #e2e8f0" },
  itemImg: { width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemCategory: { fontSize: "10px", color: "#38a169", fontWeight: "700", margin: "0 0 2px", letterSpacing: "0.5px" },
  itemName: { fontSize: "14px", fontWeight: "600", color: "#2d3748", margin: "0 0 2px" },
  itemUnit: { fontSize: "12px", color: "#718096", margin: 0 },
  itemRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" },
  itemQty: { fontSize: "13px", color: "#718096", backgroundColor: "#f7fafc", padding: "2px 8px", borderRadius: "6px", fontWeight: "600" },
  itemSubtotal: { fontSize: "15px", fontWeight: "700", color: "#e53e3e" },

  priceSummary: { backgroundColor: "white", borderRadius: "10px", padding: "14px 18px", border: "1px solid #e2e8f0" },
  priceRow: { display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#4a5568", marginBottom: "8px" },
  priceLabel: {},
  priceValue: {},
  priceTotalRow: { borderTop: "2px solid #e2e8f0", paddingTop: "10px", marginTop: "4px", marginBottom: 0 },
  priceTotalLabel: { fontSize: "16px", fontWeight: "700", color: "#2d3748" },
  priceTotalValue: { fontSize: "20px", fontWeight: "800", color: "#e53e3e" },

  footer: { marginTop: "24px", textAlign: "center" },
  continueBtn: { backgroundColor: "transparent", color: "#38a169", border: "2px solid #38a169", padding: "10px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
};

export default Order;

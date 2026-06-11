import { useState, useMemo, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProduct } from "../context/ProductContext";
import { useOrder } from "../context/OrderContext";

// ==================== SUB COMPONENTS ====================

const ProductRow = memo(({ product, index, categories, onEdit, onDelete }) => (
  <tr style={{ ...styles.tr, backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb" }}>
    <td style={styles.td}>
      <img src={product.image} alt={product.title} style={styles.tableImg}
        onError={(e) => { e.target.src = "https://via.placeholder.com/48"; }} />
    </td>
    <td style={styles.td}>
      <p style={styles.productName}>{product.title}</p>
      <p style={styles.productId}>ID: {product.id}</p>
    </td>
    <td style={styles.td}>
      <span style={styles.catBadge}>
        {categories.find((c) => c.key === product.category)?.icon} {product.category}
      </span>
    </td>
    <td style={styles.td}>
      <span style={styles.priceText}>{Number(product.price).toLocaleString("vi-VN")}đ</span>
    </td>
    <td style={styles.td}>
      <span style={{
        ...styles.stockBadge,
        backgroundColor: product.stock < 20 ? "#fff5f5" : "#f0fff4",
        color: product.stock < 20 ? "#e53e3e" : "#276749",
      }}>
        {product.stock < 20 ? "⚠️ " : "✅ "}{product.stock}
      </span>
    </td>
    <td style={styles.td}>
      <span style={styles.reviewBadge}>⭐ {product.reviews.length}</span>
    </td>
    <td style={styles.td}>
      <div style={styles.actionBtns}>
        <button style={styles.editBtn} onClick={() => onEdit(product)}>✏️ Sửa</button>
        <button style={styles.deleteBtn} onClick={() => onDelete(product)}>🗑️ Xóa</button>
      </div>
    </td>
  </tr>
));

const CategoryCard = memo(({ cat, productCount, onEdit, onDelete }) => (
  <div style={styles.catCard}>
    <div style={styles.catCardTop}>
      <span style={styles.catCardIcon}>{cat.icon}</span>
      <div>
        <p style={styles.catCardLabel}>{cat.label}</p>
        <p style={styles.catCardKey}>/{cat.key}</p>
      </div>
    </div>
    <p style={styles.catCardCount}>{productCount} sản phẩm</p>
    <div style={styles.actionBtns}>
      <button style={styles.editBtn} onClick={() => onEdit(cat)}>✏️ Sửa</button>
      <button style={styles.deleteBtn} onClick={() => onDelete(cat)}>🗑️ Xóa</button>
    </div>
  </div>
));

// ==================== SIMPLE BAR CHART ====================
const BarChart = ({ data, color = "#38a169" }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={chartStyles.wrapper}>
      {data.map((d, i) => (
        <div key={i} style={chartStyles.barGroup}>
          <div style={chartStyles.barWrap}>
            <div style={{ ...chartStyles.barFill, height: `${(d.value / max) * 100}%`, backgroundColor: color }} />
          </div>
          <p style={chartStyles.barLabel}>{d.label}</p>
          <p style={chartStyles.barValue}>{d.value.toLocaleString("vi-VN")}</p>
        </div>
      ))}
    </div>
  );
};

const chartStyles = {
  wrapper: { display: "flex", alignItems: "flex-end", gap: "8px", height: "160px", padding: "0 4px" },
  barGroup: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" },
  barWrap: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" },
  barFill: { width: "70%", borderRadius: "4px 4px 0 0", minHeight: "4px", transition: "height 0.3s" },
  barLabel: { fontSize: "10px", color: "#718096", margin: 0, textAlign: "center" },
  barValue: { fontSize: "11px", fontWeight: "700", color: "#2d3748", margin: 0 },
};

// ==================== ORDER STATUS BADGE ====================
const ORDER_STATUS = {
  confirmed: { label: "Đã xác nhận", color: "#2b6cb0", bg: "#ebf8ff", icon: "✅" },
  shipping:  { label: "Đang giao",   color: "#92400e", bg: "#fffff0", icon: "🚚" },
  delivered: { label: "Đã giao",     color: "#276749", bg: "#f0fff4", icon: "📦" },
  cancelled: { label: "Đã hủy",      color: "#c53030", bg: "#fff5f5", icon: "❌" },
};

// ==================== MAIN ADMIN ====================
function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    products, categories,
    addProduct, updateProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
  } = useProduct();
  const { order: orders, updateOrderStatus } = useOrder();

  const [tab, setTab] = useState("dashboard");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ title: "", category: "", price: "", stock: "", image: "" });
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ key: "", label: "", icon: "" });
  const [searchProduct, setSearchProduct] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // ---- STATS ----
  const totalRevenue = useMemo(() =>
    orders.reduce((s, o) => o.status !== "cancelled" ? s + o.total : s, 0), [orders]);

  const lowStockItems = useMemo(() =>
    products.filter((p) => p.stock < 20), [products]);

  const catProductCount = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c.key] = products.filter((p) => p.category === c.key).length; });
    return map;
  }, [categories, products]);

  // ---- REVENUE CHART DATA ----
  const revenueByCategory = useMemo(() => {
    return categories.map((cat) => {
      const rev = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => {
          const catItems = (o.items || []).filter((i) => i.category === cat.key);
          return sum + catItems.reduce((s, i) => s + i.price * i.quantity, 0);
        }, 0);
      return { label: cat.icon, value: rev };
    });
  }, [categories, orders]);

  const ordersByStatus = useMemo(() => {
    const map = {};
    orders.forEach((o) => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(ORDER_STATUS).map(([key, val]) => ({
      label: val.icon, value: map[key] || 0,
    }));
  }, [orders]);

  // ---- PRODUCT HANDLERS ----
  const openAddProduct = useCallback(() => {
    setEditProduct(null);
    setProductForm({ title: "", category: categories[0]?.key || "", price: "", stock: "", image: "" });
    setShowProductModal(true);
  }, [categories]);

  const openEditProduct = useCallback((product) => {
    setEditProduct(product);
    setProductForm({ title: product.title, category: product.category, price: product.price, stock: product.stock, image: product.image });
    setShowProductModal(true);
  }, []);

  const handleSaveProduct = useCallback(() => {
    if (!productForm.title || !productForm.price || !productForm.stock) { alert("Vui lòng điền đầy đủ!"); return; }
    const data = { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) };
    editProduct ? updateProduct(editProduct.id, data) : addProduct(data);
    setShowProductModal(false);
  }, [productForm, editProduct, updateProduct, addProduct]);

  // ---- CATEGORY HANDLERS ----
  const openAddCat = useCallback(() => { setEditCat(null); setCatForm({ key: "", label: "", icon: "" }); setShowCatModal(true); }, []);
  const openEditCat = useCallback((cat) => { setEditCat(cat); setCatForm({ key: cat.key, label: cat.label, icon: cat.icon }); setShowCatModal(true); }, []);

  const handleSaveCat = useCallback(() => {
    if (!catForm.key || !catForm.label) { alert("Vui lòng điền đầy đủ!"); return; }
    if (editCat) { updateCategory(editCat.key, catForm); }
    else {
      if (categories.find((c) => c.key === catForm.key)) { alert("Mã danh mục đã tồn tại!"); return; }
      addCategory(catForm);
    }
    setShowCatModal(false);
  }, [catForm, editCat, categories, updateCategory, addCategory]);

  const handleDeleteConfirmed = useCallback(() => {
    if (!confirmDelete) return;
    if (confirmDelete.type === "product") deleteProduct(confirmDelete.data.id);
    else deleteCategory(confirmDelete.data.key);
    setConfirmDelete(null);
  }, [confirmDelete, deleteProduct, deleteCategory]);

  const filteredProducts = useMemo(() => products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(searchProduct.toLowerCase());
    const matchCat = filterCategory ? p.category === filterCategory : true;
    return matchSearch && matchCat;
  }), [products, searchProduct, filterCategory]);

  const filteredOrders = useMemo(() => orders.filter((o) => {
    const matchSearch = (o.name || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.id || "").toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderStatusFilter ? o.status === orderStatusFilter : true;
    return matchSearch && matchStatus;
  }), [orders, orderSearch, orderStatusFilter]);

  if (!user) return (
    <div style={styles.accessDenied}>
      <p style={{ fontSize: "48px" }}>🔒</p>
      <h2>Bạn cần đăng nhập</h2>
      <button style={styles.loginBtn} onClick={() => navigate("/login")}>Đăng nhập</button>
    </div>
  );

  const TABS = [
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "orders", icon: "📋", label: "Đơn hàng", badge: orders.filter((o) => o.status === "confirmed").length },
    { key: "products", icon: "🏪", label: "Sản phẩm" },
    { key: "categories", icon: "📦", label: "Danh mục" },
  ];

  return (
    <div style={styles.page}>
      {/* ===== SIDEBAR ===== */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={{ fontSize: "28px" }}>🛒</span>
          <div>
            <p style={styles.sidebarTitle}>FoodMart</p>
            <p style={styles.sidebarSub}>Admin Panel</p>
          </div>
        </div>

        <nav style={styles.sidebarNav}>
          {TABS.map((item) => (
            <button key={item.key}
              style={{ ...styles.sidebarItem, ...(tab === item.key ? styles.sidebarItemActive : {}) }}
              onClick={() => setTab(item.key)}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={styles.sidebarBadge}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.sidebarUser}>
            <div style={styles.sidebarAvatar}>{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <p style={styles.sidebarUserName}>{user.name}</p>
              <p style={styles.sidebarUserRole}>Administrator</p>
            </div>
          </div>
          <button style={styles.backBtn} onClick={() => navigate("/")}>← Về trang chủ</button>
        </div>
      </div>

      {/* ===== MAIN ===== */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.mainHeader}>
          <div>
            <h1 style={styles.mainTitle}>
              {TABS.find((t) => t.key === tab)?.icon}{" "}
              {tab === "dashboard" && "Dashboard"}
              {tab === "orders" && "Quản lý Đơn hàng"}
              {tab === "products" && "Quản lý Sản phẩm"}
              {tab === "categories" && "Quản lý Danh mục"}
            </h1>
            <p style={styles.mainSub}>
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* ===== DASHBOARD ===== */}
        {tab === "dashboard" && (
          <div>
            {/* Stats */}
            <div style={styles.statsGrid}>
              {[
                { icon: "💰", value: `${totalRevenue.toLocaleString("vi-VN")}đ`, label: "Tổng doanh thu", color: "#38a169", bg: "#f0fff4" },
                { icon: "📋", value: orders.length, label: "Tổng đơn hàng", color: "#3182ce", bg: "#ebf8ff" },
                { icon: "🏪", value: products.length, label: "Sản phẩm", color: "#d69e2e", bg: "#fffff0" },
                { icon: "⚠️", value: lowStockItems.length, label: "Sắp hết hàng", color: "#e53e3e", bg: "#fff5f5" },
              ].map((stat, i) => (
                <div key={i} style={{ ...styles.statCard, borderTop: `4px solid ${stat.color}`, backgroundColor: stat.bg }}>
                  <div style={styles.statTop}>
                    <span style={{ fontSize: "32px" }}>{stat.icon}</span>
                    <span style={{ ...styles.statValue, color: stat.color }}>{stat.value}</span>
                  </div>
                  <p style={styles.statLabel}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={styles.chartsRow}>
              {/* Revenue by category */}
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>💰 Doanh thu theo danh mục</h3>
                {totalRevenue > 0 ? (
                  <BarChart data={revenueByCategory} color="#38a169" />
                ) : (
                  <div style={styles.noData}>Chưa có doanh thu</div>
                )}
                <div style={styles.chartLegend}>
                  {categories.map((cat) => (
                    <span key={cat.key} style={styles.legendItem}>{cat.icon} {cat.label}</span>
                  ))}
                </div>
              </div>

              {/* Orders by status */}
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>📋 Đơn hàng theo trạng thái</h3>
                {orders.length > 0 ? (
                  <BarChart data={ordersByStatus} color="#3182ce" />
                ) : (
                  <div style={styles.noData}>Chưa có đơn hàng</div>
                )}
                <div style={styles.chartLegend}>
                  {Object.entries(ORDER_STATUS).map(([key, val]) => (
                    <span key={key} style={styles.legendItem}>{val.icon} {val.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div style={styles.recentBox}>
              <div style={styles.recentHeader}>
                <h3 style={styles.chartTitle}>🕐 Đơn hàng gần đây</h3>
                <button style={styles.viewAllBtn} onClick={() => setTab("orders")}>Xem tất cả →</button>
              </div>
              {orders.length === 0 ? (
                <div style={styles.noData}>Chưa có đơn hàng nào</div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      <th style={styles.th}>Mã đơn</th>
                      <th style={styles.th}>Khách hàng</th>
                      <th style={styles.th}>Sản phẩm</th>
                      <th style={styles.th}>Tổng tiền</th>
                      <th style={styles.th}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o, i) => {
                      const st = ORDER_STATUS[o.status] || ORDER_STATUS.confirmed;
                      return (
                        <tr key={o.id} style={{ ...styles.tr, backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                          <td style={styles.td}><span style={styles.orderId}>#{(o.id || "").slice(-6)}</span></td>
                          <td style={styles.td}>
                            <p style={{ margin: 0, fontWeight: "600", fontSize: "13px" }}>{o.name}</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#718096" }}>{o.phone}</p>
                          </td>
                          <td style={styles.td}><span style={styles.reviewBadge}>{(o.items || []).reduce((s, i) => s + i.quantity, 0)} sp</span></td>
                          <td style={styles.td}><span style={styles.priceText}>{o.total.toLocaleString("vi-VN")}đ</span></td>
                          <td style={styles.td}>
                            <span style={{ ...styles.statusBadge, color: st.color, backgroundColor: st.bg }}>
                              {st.icon} {st.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Low stock */}
            {lowStockItems.length > 0 && (
              <div style={styles.warningBox}>
                <h3 style={styles.warningTitle}>⚠️ Sản phẩm sắp hết hàng</h3>
                <div style={styles.warningList}>
                  {lowStockItems.map((p) => (
                    <div key={p.id} style={styles.warningItem}>
                      <img src={p.image} alt={p.title} style={styles.warningImg}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }} />
                      <span style={styles.warningName}>{p.title}</span>
                      <span style={styles.warningStock}>Còn {p.stock} sp</span>
                      <button style={styles.editSmallBtn}
                        onClick={() => { setTab("products"); openEditProduct(p); }}>
                        Sửa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== ORDERS ===== */}
        {tab === "orders" && (
          <div>
            {/* Controls */}
            <div style={styles.tableControls}>
              <input type="text" placeholder="🔍 Tìm theo tên, mã đơn..."
                value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                style={styles.tableSearch} />
              <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}
                style={styles.tableFilter}>
                <option value="">Tất cả trạng thái</option>
                {Object.entries(ORDER_STATUS).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
              <span style={styles.tableCount}>{filteredOrders.length} đơn hàng</span>
            </div>

            {/* Summary badges */}
            <div style={styles.orderStatusSummary}>
              {Object.entries(ORDER_STATUS).map(([key, val]) => {
                const count = orders.filter((o) => o.status === key).length;
                return (
                  <div key={key} style={{ ...styles.statusSummaryCard, borderLeft: `3px solid ${val.color}`, backgroundColor: val.bg }}>
                    <span style={{ fontSize: "20px" }}>{val.icon}</span>
                    <div>
                      <p style={{ ...styles.statValue, color: val.color, fontSize: "20px" }}>{count}</p>
                      <p style={styles.statLabel}>{val.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredOrders.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={{ fontSize: "48px" }}>📋</p>
                <p>Không có đơn hàng nào</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredOrders.map((o) => {
                  const st = ORDER_STATUS[o.status] || ORDER_STATUS.confirmed;
                  const isOpen = expandedOrder === o.id;
                  return (
                    <div key={o.id} style={styles.orderCard}>
                      {/* Order Header */}
                      <div style={styles.orderCardHeader}
                        onClick={() => setExpandedOrder(isOpen ? null : o.id)}>
                        <div style={styles.orderCardLeft}>
                          <span style={styles.orderId}>#{(o.id || "").slice(-6)}</span>
                          <span style={{ ...styles.statusBadge, color: st.color, backgroundColor: st.bg }}>
                            {st.icon} {st.label}
                          </span>
                          <span style={styles.orderDate}>
                            🕐 {new Date(o.date).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div style={styles.orderCardRight}>
                          <span style={styles.priceText}>{o.total.toLocaleString("vi-VN")}đ</span>
                          <span style={{ fontSize: "12px", color: "#718096" }}>
                            {(o.items || []).reduce((s, i) => s + i.quantity, 0)} sp
                          </span>
                          <span style={{ fontSize: "12px", color: "#a0aec0" }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </div>

                      {/* Order Detail */}
                      {isOpen && (
                        <div style={styles.orderCardDetail}>
                          {/* Customer info */}
                          <div style={styles.orderInfoGrid}>
                            <div style={styles.orderInfoBox}>
                              <p style={styles.orderInfoLabel}>👤 Khách hàng</p>
                              <p style={styles.orderInfoValue}>{o.name}</p>
                            </div>
                            <div style={styles.orderInfoBox}>
                              <p style={styles.orderInfoLabel}>📞 Điện thoại</p>
                              <p style={styles.orderInfoValue}>{o.phone}</p>
                            </div>
                            <div style={styles.orderInfoBox}>
                              <p style={styles.orderInfoLabel}>📍 Địa chỉ</p>
                              <p style={styles.orderInfoValue}>{o.address}</p>
                            </div>
                            {o.note && (
                              <div style={styles.orderInfoBox}>
                                <p style={styles.orderInfoLabel}>📝 Ghi chú</p>
                                <p style={styles.orderInfoValue}>{o.note}</p>
                              </div>
                            )}
                          </div>

                          {/* Items */}
                          <p style={styles.itemsTitle}>🛒 Sản phẩm</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                            {(o.items || []).map((item, i) => (
                              <div key={i} style={styles.orderItemRow}>
                                <img src={item.image} alt={item.title} style={styles.orderItemImg}
                                  onError={(e) => { e.target.src = "https://via.placeholder.com/44"; }} />
                                <span style={{ flex: 1, fontSize: "13px", fontWeight: "600", color: "#2d3748" }}>{item.title}</span>
                                <span style={{ fontSize: "12px", color: "#718096" }}>x{item.quantity}</span>
                                <span style={styles.priceText}>{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
                              </div>
                            ))}
                          </div>

                          {/* Price summary */}
                          <div style={styles.orderPriceBox}>
                            <div style={styles.orderPriceRow}>
                              <span>Tạm tính:</span>
                              <span>{o.subtotal.toLocaleString("vi-VN")}đ</span>
                            </div>
                            <div style={styles.orderPriceRow}>
                              <span>Phí giao hàng:</span>
                              <span style={{ color: "#38a169" }}>{o.shipping === 0 ? "Miễn phí" : `${o.shipping.toLocaleString("vi-VN")}đ`}</span>
                            </div>
                            <div style={{ ...styles.orderPriceRow, fontWeight: "700", fontSize: "16px", borderTop: "2px solid #e2e8f0", paddingTop: "8px" }}>
                              <span>Tổng cộng:</span>
                              <span style={{ color: "#e53e3e" }}>{o.total.toLocaleString("vi-VN")}đ</span>
                            </div>
                          </div>

                          {/* Update status */}
                          <div style={styles.statusUpdateBox}>
                            <p style={styles.orderInfoLabel}>🔄 Cập nhật trạng thái:</p>
                            <div style={styles.statusBtns}>
                              {Object.entries(ORDER_STATUS).map(([key, val]) => (
                                <button
                                  key={key}
                                  style={{
                                    ...styles.statusUpdateBtn,
                                    backgroundColor: o.status === key ? val.color : "#f7fafc",
                                    color: o.status === key ? "white" : val.color,
                                    border: `2px solid ${val.color}`,
                                  }}
                                  onClick={() => updateOrderStatus(o.id, key)}
                                >
                                  {val.icon} {val.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== PRODUCTS ===== */}
        {tab === "products" && (
          <div>
            <div style={styles.tableControls}>
              <input type="text" placeholder="🔍 Tìm kiếm sản phẩm..."
                value={searchProduct} onChange={(e) => setSearchProduct(e.target.value)}
                style={styles.tableSearch} />
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                style={styles.tableFilter}>
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                ))}
              </select>
              <span style={styles.tableCount}>{filteredProducts.length} sản phẩm</span>
              <button style={styles.addBtn} onClick={openAddProduct}>+ Thêm sản phẩm</button>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Ảnh</th>
                    <th style={styles.th}>Tên sản phẩm</th>
                    <th style={styles.th}>Danh mục</th>
                    <th style={styles.th}>Giá</th>
                    <th style={styles.th}>Tồn kho</th>
                    <th style={styles.th}>Đánh giá</th>
                    <th style={styles.th}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <ProductRow key={product.id} product={product} index={index}
                      categories={categories} onEdit={openEditProduct}
                      onDelete={(p) => setConfirmDelete({ type: "product", data: p })} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== CATEGORIES ===== */}
        {tab === "categories" && (
          <div>
            <div style={styles.tableControls}>
              <span style={styles.tableCount}>{categories.length} danh mục</span>
              <button style={styles.addBtn} onClick={openAddCat}>+ Thêm danh mục</button>
            </div>
            <div style={styles.catGrid}>
              {categories.map((cat) => (
                <CategoryCard key={cat.key} cat={cat}
                  productCount={catProductCount[cat.key] || 0}
                  onEdit={openEditCat}
                  onDelete={(c) => setConfirmDelete({ type: "category", data: c })} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== PRODUCT MODAL ===== */}
      {showProductModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editProduct ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm"}</h2>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Tên sản phẩm *</label>
              <input style={styles.modalInput} placeholder="Nhập tên sản phẩm"
                value={productForm.title}
                onChange={(e) => setProductForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Danh mục *</label>
              <select style={styles.modalInput} value={productForm.category}
                onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))}>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div style={styles.modalRow}>
              <div style={{ ...styles.modalField, flex: 1 }}>
                <label style={styles.modalLabel}>Giá (đ) *</label>
                <input style={styles.modalInput} type="number" placeholder="VD: 45000"
                  value={productForm.price}
                  onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))} />
              </div>
              <div style={{ ...styles.modalField, flex: 1 }}>
                <label style={styles.modalLabel}>Tồn kho *</label>
                <input style={styles.modalInput} type="number" placeholder="VD: 100"
                  value={productForm.stock}
                  onChange={(e) => setProductForm((f) => ({ ...f, stock: e.target.value }))} />
              </div>
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>URL Hình ảnh</label>
              <input style={styles.modalInput} placeholder="https://images.unsplash.com/..."
                value={productForm.image}
                onChange={(e) => setProductForm((f) => ({ ...f, image: e.target.value }))} />
              {productForm.image && (
                <img src={productForm.image} alt="preview" style={styles.imagePreview}
                  onError={(e) => { e.target.style.display = "none"; }} />
              )}
            </div>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowProductModal(false)}>Hủy</button>
              <button style={styles.saveBtn} onClick={handleSaveProduct}>
                {editProduct ? "💾 Cập nhật" : "➕ Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CATEGORY MODAL ===== */}
      {showCatModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editCat ? "✏️ Sửa danh mục" : "➕ Thêm danh mục"}</h2>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Mã danh mục * (không dấu, dùng -)</label>
              <input style={{ ...styles.modalInput, ...(editCat ? { backgroundColor: "#f7fafc", color: "#a0aec0" } : {}) }}
                placeholder="VD: do-uong" value={catForm.key} disabled={!!editCat}
                onChange={(e) => setCatForm((f) => ({ ...f, key: e.target.value.toLowerCase().replace(/\s/g, "-") }))} />
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Tên danh mục *</label>
              <input style={styles.modalInput} placeholder="VD: Đồ Uống" value={catForm.label}
                onChange={(e) => setCatForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Icon (emoji)</label>
              <input style={styles.modalInput} placeholder="VD: 🥤" value={catForm.icon}
                onChange={(e) => setCatForm((f) => ({ ...f, icon: e.target.value }))} />
              {catForm.icon && (
                <div style={styles.iconPreview}>
                  <span style={{ fontSize: "32px" }}>{catForm.icon}</span>
                  <span style={{ color: "#4a5568", marginLeft: "8px" }}>{catForm.label}</span>
                </div>
              )}
            </div>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowCatModal(false)}>Hủy</button>
              <button style={styles.saveBtn} onClick={handleSaveCat}>
                {editCat ? "💾 Cập nhật" : "➕ Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIRM DELETE ===== */}
      {confirmDelete && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: "400px" }}>
            <p style={{ fontSize: "48px", textAlign: "center" }}>🗑️</p>
            <h2 style={{ ...styles.modalTitle, textAlign: "center" }}>Xác nhận xóa</h2>
            <p style={styles.confirmText}>
              Bạn có chắc muốn xóa <strong>
                {confirmDelete.type === "product" ? confirmDelete.data.title : confirmDelete.data.label}
              </strong>?
            </p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Hủy</button>
              <button style={{ ...styles.saveBtn, backgroundColor: "#e53e3e" }} onClick={handleDeleteConfirmed}>
                🗑️ Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#f0f4f8" },
  accessDenied: { textAlign: "center", padding: "80px", flex: 1 },
  loginBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "600", marginTop: "16px" },

  // Sidebar
  sidebar: { width: "260px", backgroundColor: "#1a202c", minHeight: "100vh", display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: "2px 0 8px rgba(0,0,0,0.15)" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: "12px", padding: "24px 20px", borderBottom: "1px solid #2d3748" },
  sidebarTitle: { color: "white", fontWeight: "800", fontSize: "18px", margin: 0 },
  sidebarSub: { color: "#68d391", fontSize: "11px", margin: 0, fontWeight: "600" },
  sidebarNav: { flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" },
  sidebarItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: "none", backgroundColor: "transparent", color: "#a0aec0", fontSize: "14px", fontWeight: "500", cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.2s" },
  sidebarItemActive: { backgroundColor: "#38a169", color: "white", boxShadow: "0 2px 8px rgba(56,161,105,0.4)" },
  sidebarBadge: { backgroundColor: "#fc8181", color: "white", fontSize: "10px", fontWeight: "800", padding: "2px 7px", borderRadius: "20px", minWidth: "20px", textAlign: "center" },
  sidebarFooter: { padding: "16px", borderTop: "1px solid #2d3748" },
  sidebarUser: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  sidebarAvatar: { width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#38a169", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "16px", flexShrink: 0 },
  sidebarUserName: { color: "white", fontSize: "13px", fontWeight: "600", margin: 0 },
  sidebarUserRole: { color: "#68d391", fontSize: "11px", margin: 0 },
  backBtn: { width: "100%", padding: "10px", backgroundColor: "#2d3748", color: "#a0aec0", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px" },

  // Main
  main: { flex: 1, padding: "24px 32px", overflowY: "auto" },
  mainHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
  mainTitle: { fontSize: "24px", fontWeight: "800", color: "#2d3748", margin: "0 0 4px" },
  mainSub: { fontSize: "13px", color: "#718096", margin: 0 },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  statTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  statValue: { fontSize: "24px", fontWeight: "800", color: "#2d3748" },
  statLabel: { fontSize: "13px", color: "#718096", margin: 0 },

  // Charts
  chartsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" },
  chartCard: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  chartTitle: { fontSize: "15px", fontWeight: "700", color: "#2d3748", marginBottom: "16px" },
  chartLegend: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" },
  legendItem: { fontSize: "11px", color: "#718096", backgroundColor: "#f7fafc", padding: "3px 8px", borderRadius: "6px" },
  noData: { textAlign: "center", color: "#a0aec0", padding: "40px", fontSize: "14px" },

  // Recent orders
  recentBox: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "24px" },
  recentHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  viewAllBtn: { backgroundColor: "transparent", color: "#38a169", border: "2px solid #38a169", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },

  // Warning
  warningBox: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #fed7d7" },
  warningTitle: { fontSize: "15px", fontWeight: "700", color: "#e53e3e", marginBottom: "12px" },
  warningList: { display: "flex", flexDirection: "column", gap: "10px" },
  warningItem: { display: "flex", alignItems: "center", gap: "12px", padding: "10px", backgroundColor: "#fff5f5", borderRadius: "8px" },
  warningImg: { width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" },
  warningName: { flex: 1, fontSize: "14px", fontWeight: "600", color: "#2d3748" },
  warningStock: { fontSize: "13px", fontWeight: "700", color: "#e53e3e" },
  editSmallBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },

  // Orders tab
  orderStatusSummary: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" },
  statusSummaryCard: { backgroundColor: "white", borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  orderCard: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" },
  orderCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", cursor: "pointer" },
  orderCardLeft: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  orderCardRight: { display: "flex", alignItems: "center", gap: "12px" },
  orderId: { fontSize: "14px", fontWeight: "800", color: "#2d3748", fontFamily: "monospace" },
  orderDate: { fontSize: "12px", color: "#718096" },
  statusBadge: { fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" },
  orderCardDetail: { borderTop: "2px solid #f0f4f8", padding: "20px", backgroundColor: "#fafcff" },
  orderInfoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" },
  orderInfoBox: { backgroundColor: "white", borderRadius: "8px", padding: "10px 14px", border: "1px solid #e2e8f0" },
  orderInfoLabel: { fontSize: "11px", color: "#a0aec0", fontWeight: "700", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" },
  orderInfoValue: { fontSize: "14px", color: "#2d3748", fontWeight: "600", margin: 0 },
  itemsTitle: { fontSize: "13px", fontWeight: "700", color: "#4a5568", marginBottom: "10px" },
  orderItemRow: { display: "flex", alignItems: "center", gap: "10px", backgroundColor: "white", borderRadius: "8px", padding: "10px", border: "1px solid #e2e8f0" },
  orderItemImg: { width: "44px", height: "44px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 },
  orderPriceBox: { backgroundColor: "white", borderRadius: "8px", padding: "12px 16px", border: "1px solid #e2e8f0", marginBottom: "16px" },
  orderPriceRow: { display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#4a5568", marginBottom: "6px" },
  statusUpdateBox: { backgroundColor: "#f7fafc", borderRadius: "8px", padding: "14px" },
  statusBtns: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" },
  statusUpdateBtn: { padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "700", transition: "all 0.2s" },
  emptyBox: { textAlign: "center", padding: "60px", color: "#718096", backgroundColor: "white", borderRadius: "12px" },

  // Table
  tableControls: { display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" },
  tableSearch: { flex: 1, minWidth: "200px", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" },
  tableFilter: { padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", backgroundColor: "white", cursor: "pointer" },
  tableCount: { color: "#718096", fontSize: "14px", whiteSpace: "nowrap" },
  addBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "700", whiteSpace: "nowrap" },
  tableWrapper: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: "#f7fafc", borderBottom: "2px solid #e2e8f0" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#718096", textTransform: "uppercase", letterSpacing: "0.5px" },
  tr: { borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px 16px", fontSize: "14px", color: "#2d3748", verticalAlign: "middle" },
  tableImg: { width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" },
  productName: { fontWeight: "600", fontSize: "14px", margin: "0 0 2px", color: "#2d3748" },
  productId: { fontSize: "11px", color: "#a0aec0", margin: 0 },
  catBadge: { backgroundColor: "#e6fffa", color: "#276749", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  priceText: { fontWeight: "700", color: "#e53e3e", fontSize: "14px" },
  stockBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  reviewBadge: { color: "#744210", fontSize: "13px" },
  actionBtns: { display: "flex", gap: "8px" },
  editBtn: { backgroundColor: "#ebf8ff", color: "#2b6cb0", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  deleteBtn: { backgroundColor: "#fff5f5", color: "#e53e3e", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },

  // Categories
  catGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
  catCard: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  catCardTop: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" },
  catCardIcon: { fontSize: "36px" },
  catCardLabel: { fontWeight: "700", fontSize: "16px", color: "#2d3748", margin: "0 0 2px" },
  catCardKey: { fontSize: "12px", color: "#a0aec0", margin: 0 },
  catCardCount: { fontSize: "13px", color: "#718096", marginBottom: "12px" },

  // Modal
  overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  modal: { backgroundColor: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontSize: "20px", fontWeight: "800", color: "#2d3748", marginBottom: "24px" },
  modalField: { marginBottom: "16px" },
  modalRow: { display: "flex", gap: "16px" },
  modalLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "6px" },
  modalInput: { width: "100%", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  imagePreview: { width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginTop: "8px" },
  iconPreview: { display: "flex", alignItems: "center", marginTop: "8px", padding: "8px", backgroundColor: "#f7fafc", borderRadius: "8px" },
  modalActions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" },
  cancelBtn: { padding: "10px 20px", backgroundColor: "#e2e8f0", color: "#4a5568", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  saveBtn: { padding: "10px 24px", backgroundColor: "#38a169", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "700" },
  confirmText: { fontSize: "15px", color: "#4a5568", textAlign: "center", lineHeight: "1.6", marginBottom: "8px" },
};

export default Admin;
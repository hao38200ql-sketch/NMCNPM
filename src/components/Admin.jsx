import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProduct } from "../context/ProductContext";



function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    products, categories,
    addProduct, updateProduct, deleteProduct,
    addCategory, updateCategory, deleteCategory,
  } = useProduct();

  const [tab, setTab] = useState("dashboard");

  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: "", category: "", price: "", stock: "", image: "",
  });
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ key: "", label: "", icon: "" });

  const [searchProduct, setSearchProduct] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(null);

  if (!user) {
    return (
      <div style={styles.accessDenied}>
        <p style={{ fontSize: "48px" }}>🔒</p>
        <h2>Bạn cần đăng nhập để truy cập trang này</h2>
        <button style={styles.loginBtn} onClick={() => navigate("/login")}>
          Đăng nhập
        </button>
      </div>
    );
  }

  const openAddProduct = () => {
    setEditProduct(null);
    setProductForm({ title: "", category: categories[0]?.key || "", price: "", stock: "", image: "" });
    setShowProductModal(true);
  };

  const openEditProduct = (product) => {
    setEditProduct(product);
    setProductForm({
      title: product.title,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.title || !productForm.price || !productForm.stock) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    const data = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
    };
    if (editProduct) {
      updateProduct(editProduct.id, data);
    } else {
      addProduct(data);
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = (id) => {
    deleteProduct(id);
    setConfirmDelete(null);
  };

  const openAddCat = () => {
    setEditCat(null);
    setCatForm({ key: "", label: "", icon: "" });
    setShowCatModal(true);
  };

  const openEditCat = (cat) => {
    setEditCat(cat);
    setCatForm({ key: cat.key, label: cat.label, icon: cat.icon });
    setShowCatModal(true);
  };

  const handleSaveCat = () => {
    if (!catForm.key || !catForm.label) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (editCat) {
      updateCategory(editCat.key, catForm);
    } else {
      if (categories.find((c) => c.key === catForm.key)) {
        alert("Mã danh mục đã tồn tại!");
        return;
      }
      addCategory(catForm);
    }
    setShowCatModal(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(searchProduct.toLowerCase());
    const matchCat = filterCategory ? p.category === filterCategory : true;
    return matchSearch && matchCat;
  });

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStockItems = products.filter((p) => p.stock < 20).length;

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={{ fontSize: "28px" }}>🛒</span>
          <div>
            <p style={styles.sidebarTitle}>FoodMart</p>
            <p style={styles.sidebarSub}>Admin Panel</p>
          </div>
        </div>

        <nav style={styles.sidebarNav}>
          {[
            { key: "dashboard", icon: "📊", label: "Dashboard" },
            { key: "products", icon: "🏪", label: "Sản phẩm" },
            { key: "categories", icon: "📦", label: "Danh mục" },
          ].map((item) => (
            <button
              key={item.key}
              style={{
                ...styles.sidebarItem,
                ...(tab === item.key ? styles.sidebarItemActive : {}),
              }}
              onClick={() => setTab(item.key)}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ← Về trang chủ
        </button>
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.mainHeader}>
          <h1 style={styles.mainTitle}>
            {tab === "dashboard" && "📊 Dashboard"}
            {tab === "products" && "🏪 Quản lý Sản phẩm"}
            {tab === "categories" && "📦 Quản lý Danh mục"}
          </h1>
          <div style={styles.adminInfo}>
            <div style={styles.adminAvatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={styles.adminName}>{user.name}</span>
          </div>
        </div>

        {tab === "dashboard" && (
          <div>
            <div style={styles.statsGrid}>
              <div style={{ ...styles.statCard, borderLeft: "4px solid #38a169" }}>
                <p style={styles.statIcon}>🏪</p>
                <p style={styles.statValue}>{totalProducts}</p>
                <p style={styles.statLabel}>Tổng sản phẩm</p>
              </div>
              <div style={{ ...styles.statCard, borderLeft: "4px solid #3182ce" }}>
                <p style={styles.statIcon}>📦</p>
                <p style={styles.statValue}>{totalCategories}</p>
                <p style={styles.statLabel}>Danh mục</p>
              </div>
              <div style={{ ...styles.statCard, borderLeft: "4px solid #d69e2e" }}>
                <p style={styles.statIcon}>📋</p>
                <p style={styles.statValue}>{totalStock.toLocaleString()}</p>
                <p style={styles.statLabel}>Tổng tồn kho</p>
              </div>
              <div style={{ ...styles.statCard, borderLeft: "4px solid #e53e3e" }}>
                <p style={styles.statIcon}>⚠️</p>
                <p style={styles.statValue}>{lowStockItems}</p>
                <p style={styles.statLabel}>Sắp hết hàng</p>
              </div>
            </div>

            {lowStockItems > 0 && (
              <div style={styles.warningBox}>
                <h3 style={styles.warningTitle}>⚠️ Sản phẩm sắp hết hàng</h3>
                <div style={styles.warningList}>
                  {products.filter((p) => p.stock < 20).map((p) => (
                    <div key={p.id} style={styles.warningItem}>
                      <img src={p.image} alt={p.title} style={styles.warningImg}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }} />
                      <span style={styles.warningName}>{p.title}</span>
                      <span style={styles.warningStock}>Còn {p.stock} sp</span>
                      <button style={styles.editSmallBtn} onClick={() => { setTab("products"); openEditProduct(p); }}>
                        Sửa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.catSummary}>
              <h3 style={styles.catSummaryTitle}>📦 Thống kê theo danh mục</h3>
              <div style={styles.catSummaryGrid}>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.key).length;
                  return (
                    <div key={cat.key} style={styles.catSummaryCard}>
                      <span style={{ fontSize: "28px" }}>{cat.icon}</span>
                      <p style={styles.catSummaryLabel}>{cat.label}</p>
                      <p style={styles.catSummaryCount}>{count} sản phẩm</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div>
            <div style={styles.tableControls}>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm sản phẩm..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                style={styles.tableSearch}
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={styles.tableFilter}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                ))}
              </select>
              <span style={styles.tableCount}>{filteredProducts.length} sản phẩm</span>
              <button style={styles.addBtn} onClick={openAddProduct}>
                + Thêm sản phẩm
              </button>
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
                    <tr key={product.id} style={{ ...styles.tr, backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb" }}>
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
                          <button style={styles.editBtn} onClick={() => openEditProduct(product)}>
                            ✏️ Sửa
                          </button>
                          <button style={styles.deleteBtn} onClick={() => setConfirmDelete({ type: "product", data: product })}>
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div>
            <div style={styles.tableControls}>
              <span style={styles.tableCount}>{categories.length} danh mục</span>
              <button style={styles.addBtn} onClick={openAddCat}>
                + Thêm danh mục
              </button>
            </div>

            <div style={styles.catGrid}>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.key).length;
                return (
                  <div key={cat.key} style={styles.catCard}>
                    <div style={styles.catCardTop}>
                      <span style={styles.catCardIcon}>{cat.icon}</span>
                      <div>
                        <p style={styles.catCardLabel}>{cat.label}</p>
                        <p style={styles.catCardKey}>/{cat.key}</p>
                      </div>
                    </div>
                    <p style={styles.catCardCount}>{count} sản phẩm</p>
                    <div style={styles.actionBtns}>
                      <button style={styles.editBtn} onClick={() => openEditCat(cat)}>
                        ✏️ Sửa
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => setConfirmDelete({ type: "category", data: cat })}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showProductModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editProduct ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm"}
            </h2>

            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Tên sản phẩm *</label>
              <input
                style={styles.modalInput}
                placeholder="Nhập tên sản phẩm"
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              />
            </div>

            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Danh mục *</label>
              <select
                style={styles.modalInput}
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.modalRow}>
              <div style={{ ...styles.modalField, flex: 1 }}>
                <label style={styles.modalLabel}>Giá (đ) *</label>
                <input
                  style={styles.modalInput}
                  type="number"
                  placeholder="VD: 45000"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                />
              </div>
              <div style={{ ...styles.modalField, flex: 1 }}>
                <label style={styles.modalLabel}>Tồn kho *</label>
                <input
                  style={styles.modalInput}
                  type="number"
                  placeholder="VD: 100"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.modalField}>
              <label style={styles.modalLabel}>URL Hình ảnh</label>
              <input
                style={styles.modalInput}
                placeholder="https://images.unsplash.com/..."
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
              />
              {productForm.image && (
                <img src={productForm.image} alt="preview" style={styles.imagePreview}
                  onError={(e) => { e.target.style.display = "none"; }} />
              )}
            </div>

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowProductModal(false)}>
                Hủy
              </button>
              <button style={styles.saveBtn} onClick={handleSaveProduct}>
                {editProduct ? "💾 Cập nhật" : "➕ Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCatModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editCat ? "✏️ Sửa danh mục" : "➕ Thêm danh mục"}
            </h2>

            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Mã danh mục * (không dấu, dùng dấu -)</label>
              <input
                style={{ ...styles.modalInput, ...(editCat ? { backgroundColor: "#f7fafc", color: "#a0aec0" } : {}) }}
                placeholder="VD: do-uong"
                value={catForm.key}
                onChange={(e) => setCatForm({ ...catForm, key: e.target.value.toLowerCase().replace(/\s/g, "-") })}
                disabled={!!editCat}
              />
            </div>

            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Tên danh mục *</label>
              <input
                style={styles.modalInput}
                placeholder="VD: Đồ Uống"
                value={catForm.label}
                onChange={(e) => setCatForm({ ...catForm, label: e.target.value })}
              />
            </div>

            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Icon (emoji)</label>
              <input
                style={styles.modalInput}
                placeholder="VD: 🥤"
                value={catForm.icon}
                onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
              />
              {catForm.icon && (
                <div style={styles.iconPreview}>
                  <span style={{ fontSize: "32px" }}>{catForm.icon}</span>
                  <span style={{ color: "#4a5568", marginLeft: "8px" }}>{catForm.label}</span>
                </div>
              )}
            </div>

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowCatModal(false)}>
                Hủy
              </button>
              <button style={styles.saveBtn} onClick={handleSaveCat}>
                {editCat ? "💾 Cập nhật" : "➕ Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: "400px" }}>
            <p style={{ fontSize: "48px", textAlign: "center" }}>🗑️</p>
            <h2 style={{ ...styles.modalTitle, textAlign: "center" }}>Xác nhận xóa</h2>
            <p style={styles.confirmText}>
              Bạn có chắc muốn xóa{" "}
              <strong>
                {confirmDelete.type === "product"
                  ? confirmDelete.data.title
                  : confirmDelete.data.label}
              </strong>
              {confirmDelete.type === "category" && " và tất cả sản phẩm thuộc danh mục này"}?
            </p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>
                Hủy
              </button>
              <button
                style={{ ...styles.saveBtn, backgroundColor: "#e53e3e" }}
                onClick={() => {
                  if (confirmDelete.type === "product") handleDeleteProduct(confirmDelete.data.id);
                  else { deleteCategory(confirmDelete.data.key); setConfirmDelete(null); }
                }}
              >
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
  page: { display: "flex", minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#f7fafc" },
  accessDenied: { textAlign: "center", padding: "80px", flex: 1 },
  loginBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "600", marginTop: "16px" },

  // Sidebar
  sidebar: { width: "240px", backgroundColor: "#2d3748", minHeight: "100vh", display: "flex", flexDirection: "column", flexShrink: 0 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: "12px", padding: "24px 20px", borderBottom: "1px solid #4a5568" },
  sidebarTitle: { color: "white", fontWeight: "800", fontSize: "18px", margin: 0 },
  sidebarSub: { color: "#a0aec0", fontSize: "11px", margin: 0 },
  sidebarNav: { flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" },
  sidebarItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#a0aec0", fontSize: "14px", fontWeight: "500", cursor: "pointer", textAlign: "left", width: "100%" },
  sidebarItemActive: { backgroundColor: "#38a169", color: "white" },
  backBtn: { margin: "16px", padding: "10px", backgroundColor: "#4a5568", color: "#a0aec0", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px" },

  // Main
  main: { flex: 1, padding: "24px 32px", overflowY: "auto" },
  mainHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  mainTitle: { fontSize: "24px", fontWeight: "800", color: "#2d3748", margin: 0 },
  adminInfo: { display: "flex", alignItems: "center", gap: "10px" },
  adminAvatar: { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#38a169", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "16px" },
  adminName: { fontSize: "14px", fontWeight: "600", color: "#4a5568" },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" },
  statCard: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  statIcon: { fontSize: "28px", margin: "0 0 8px" },
  statValue: { fontSize: "28px", fontWeight: "800", color: "#2d3748", margin: "0 0 4px" },
  statLabel: { fontSize: "13px", color: "#718096", margin: 0 },

  // Warning
  warningBox: { backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #fed7d7" },
  warningTitle: { fontSize: "16px", fontWeight: "700", color: "#e53e3e", marginBottom: "12px" },
  warningList: { display: "flex", flexDirection: "column", gap: "10px" },
  warningItem: { display: "flex", alignItems: "center", gap: "12px", padding: "10px", backgroundColor: "#fff5f5", borderRadius: "8px" },
  warningImg: { width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" },
  warningName: { flex: 1, fontSize: "14px", fontWeight: "600", color: "#2d3748" },
  warningStock: { fontSize: "13px", fontWeight: "700", color: "#e53e3e" },
  editSmallBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },

  // Category summary
  catSummary: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  catSummaryTitle: { fontSize: "16px", fontWeight: "700", color: "#2d3748", marginBottom: "16px" },
  catSummaryGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "12px" },
  catSummaryCard: { textAlign: "center", padding: "16px 8px", backgroundColor: "#f7fafc", borderRadius: "10px" },
  catSummaryLabel: { fontSize: "12px", fontWeight: "600", color: "#2d3748", margin: "6px 0 4px" },
  catSummaryCount: { fontSize: "11px", color: "#718096", margin: 0 },

  // Table controls
  tableControls: { display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" },
  tableSearch: { flex: 1, minWidth: "200px", padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" },
  tableFilter: { padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", backgroundColor: "white", cursor: "pointer" },
  tableCount: { color: "#718096", fontSize: "14px", whiteSpace: "nowrap" },
  addBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "700", whiteSpace: "nowrap" },

  // Table
  tableWrapper: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: "#f7fafc", borderBottom: "2px solid #e2e8f0" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#718096", textTransform: "uppercase", letterSpacing: "0.5px" },
  tr: { borderBottom: "1px solid #e2e8f0", transition: "background 0.1s" },
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

  // Category cards
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
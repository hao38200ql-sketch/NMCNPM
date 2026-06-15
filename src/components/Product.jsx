import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { useProduct } from "../context/ProductContext";

function Product() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();
  const { category } = useParams();
  const location = useLocation();
  const { addToCart } = useCart();
  const { t } = useLang();
  const { products } = useProduct();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search");
    if (q) setSearch(q);
    else setSearch("");
  }, [location.search]);

  const categoryNames = {
    "ngu-coc": `🌾 ${t.nguCoc}`,
    "banh-mi": `🍞 ${t.banhMi}`,
    "sua-trung": `🥛 ${t.suaTrung}`,
    "thit": `🥩 ${t.thit}`,
    "hai-san": `🦐 ${t.haiSan}`,
    "rau-cu": `🥦 ${t.rauCu}`,
    "trai-cay": `🍎 ${t.traiCay}`,
  };

  let filteredProducts = category
    ? products.filter((p) => p.category === category)
    : [...products];

  if (search) {
    filteredProducts = filteredProducts.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  filteredProducts = filteredProducts.filter(
    (p) => p.price >= minPrice && p.price <= maxPrice
  );

  if (sortBy === "title-az") filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortBy === "title-za") filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
  else if (sortBy === "price-asc") filteredProducts.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-desc") filteredProducts.sort((a, b) => b.price - a.price);

  const pageTitle = search
    ? `🔍 Kết quả: "${search}"`
    : category ? categoryNames[category] : `🏪 ${t.allProducts}`;

  const handleReset = () => {
    setSearch(""); setMinPrice(0); setMaxPrice(1000000); setSortBy("");
    navigate("/products");
  };

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div style={styles.pageHeaderContent}>
          <h1 style={styles.pageTitle}>{pageTitle}</h1>
          <p style={styles.pageSubtitle}>
            Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
          </p>
        </div>
      </div>

      <div style={styles.container}>
        {/* Controls */}
        <div style={styles.controlsBox}>
          <div style={styles.controlsLeft}>
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>🔍</span>
              <input type="text" placeholder={t.search}
                value={search} onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput} />
              {search && (
                <button style={styles.clearSearch} onClick={() => { setSearch(""); navigate("/products"); }}>✕</button>
              )}
            </div>

            <div style={styles.priceBox}>
              <span style={styles.priceBoxLabel}>💰 Giá:</span>
              <input type="number" min="0" value={minPrice}
                onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                style={styles.priceInput} placeholder="0" />
              <span style={styles.priceDash}>—</span>
              <input type="number" min="0" value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
                style={styles.priceInput} placeholder="1000000" />
              <span style={styles.priceCurrency}>đ</span>
            </div>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
              <option value="">{t.sortBy}</option>
              <option value="title-az">{t.titleAZ}</option>
              <option value="title-za">{t.titleZA}</option>
              <option value="price-asc">{t.priceLow}</option>
              <option value="price-desc">{t.priceHigh}</option>
            </select>
          </div>

          <div style={styles.controlsRight}>
            {(search || minPrice > 0 || maxPrice < 1000000) && (
              <button style={styles.resetBtn} onClick={handleReset}>✕ Xóa bộ lọc</button>
            )}
            <div style={styles.viewToggle}>
              <button style={{ ...styles.viewBtn, ...(viewMode === "grid" ? styles.viewBtnActive : {}) }}
                onClick={() => setViewMode("grid")}>⊞</button>
              <button style={{ ...styles.viewBtn, ...(viewMode === "list" ? styles.viewBtnActive : {}) }}
                onClick={() => setViewMode("list")}>☰</button>
            </div>
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "64px", margin: 0 }}>😔</p>
            <h3 style={styles.emptyTitle}>{t.noProduct}</h3>
            <p style={styles.emptySub}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button style={styles.emptyBtn} onClick={handleReset}>← Xem tất cả sản phẩm</button>
          </div>
        ) : viewMode === "grid" ? (
          <div style={styles.grid}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={styles.card}>
                <div style={styles.imageBox}>
                  <img src={product.image} alt={product.title} style={styles.img}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/200"; }} />
                  {product.stock < 20 && (
                    <span style={styles.lowStock}>🔥 {t.almostOut}</span>
                  )}
                  <div style={styles.cardOverlay}>
                    <button style={styles.overlayBtn}
                      onClick={() => navigate(`/detail/${product.id}`)}>
                      👁️ Xem nhanh
                    </button>
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.catTag}>{product.category.replace("-", " ").toUpperCase()}</p>
                  <h3 style={styles.cardTitle}>{product.title}</h3>
                  <div style={styles.cardMeta}>
                    <span style={styles.stars}>
                      {"⭐".repeat(Math.round(
                        product.reviews.reduce((s, r) => s + r.rating, 0) / (product.reviews.length || 1)
                      ))}
                    </span>
                    <span style={styles.stockTag}>Còn {product.stock}</span>
                  </div>
                  <div style={styles.cardBottom}>
                    <span style={styles.cardPrice}>{product.price.toLocaleString("vi-VN")}đ</span>
                    <div style={styles.cardBtns}>
                      <button style={styles.addCartBtn} onClick={() => addToCart(product)}>🛒</button>
                      <button style={styles.detailBtn} onClick={() => navigate(`/detail/${product.id}`)}>
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List view
          <div style={styles.listView}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={styles.listCard}>
                <img src={product.image} alt={product.title} style={styles.listImg}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/120"; }} />
                <div style={styles.listInfo}>
                  <p style={styles.catTag}>{product.category.replace("-", " ").toUpperCase()}</p>
                  <h3 style={styles.listTitle}>{product.title}</h3>
                  <div style={styles.listMeta}>
                    <span>{"⭐".repeat(Math.round(
                      product.reviews.reduce((s, r) => s + r.rating, 0) / (product.reviews.length || 1)
                    ))}</span>
                    <span style={styles.listReview}>({product.reviews.length} đánh giá)</span>
                    <span style={styles.stockTag}>Còn {product.stock} sp</span>
                  </div>
                </div>
                <div style={styles.listRight}>
                  <span style={styles.listPrice}>{product.price.toLocaleString("vi-VN")}đ</span>
                  <div style={styles.listBtns}>
                    <button style={styles.addCartBtn} onClick={() => addToCart(product)}>🛒 Thêm</button>
                    <button style={styles.detailBtn} onClick={() => navigate(`/detail/${product.id}`)}>
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif" },

  pageHeader: {
    background: "linear-gradient(135deg, #2d3748, #4a5568)",
    padding: "32px 32px",
  },
  pageHeaderContent: { maxWidth: "1200px", margin: "0 auto" },
  pageTitle: { fontSize: "28px", fontWeight: "800", color: "white", margin: "0 0 6px" },
  pageSubtitle: { fontSize: "14px", color: "#a0aec0", margin: 0 },

  container: { maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" },

  controlsBox: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "16px 20px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  controlsLeft: { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", flex: 1 },
  controlsRight: { display: "flex", gap: "8px", alignItems: "center" },

  searchWrap: { display: "flex", alignItems: "center", backgroundColor: "#f7fafc", border: "2px solid #e2e8f0", borderRadius: "10px", padding: "0 12px", minWidth: "220px" },
  searchIcon: { fontSize: "16px", marginRight: "6px" },
  searchInput: { flex: 1, border: "none", backgroundColor: "transparent", padding: "10px 0", fontSize: "14px", outline: "none" },
  clearSearch: { background: "none", border: "none", color: "#a0aec0", cursor: "pointer", fontSize: "14px", padding: "0 4px" },

  priceBox: { display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#f7fafc", border: "2px solid #e2e8f0", borderRadius: "10px", padding: "8px 12px" },
  priceBoxLabel: { fontSize: "12px", fontWeight: "700", color: "#4a5568", whiteSpace: "nowrap" },
  priceInput: { width: "80px", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 8px", fontSize: "13px", outline: "none" },
  priceDash: { color: "#a0aec0", fontSize: "14px" },
  priceCurrency: { fontSize: "12px", color: "#718096" },

  select: { padding: "10px 14px", border: "2px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", minWidth: "160px", cursor: "pointer", backgroundColor: "white", outline: "none" },

  resetBtn: { backgroundColor: "#fff5f5", color: "#e53e3e", border: "2px solid #fed7d7", padding: "9px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" },

  viewToggle: { display: "flex", backgroundColor: "#f7fafc", borderRadius: "8px", overflow: "hidden", border: "2px solid #e2e8f0" },
  viewBtn: { background: "none", border: "none", padding: "8px 14px", cursor: "pointer", fontSize: "16px", color: "#a0aec0" },
  viewBtnActive: { backgroundColor: "#38a169", color: "white" },

  // Grid
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" },
  card: { backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  imageBox: { height: "190px", overflow: "hidden", position: "relative", backgroundColor: "#f0fff4" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  lowStock: { position: "absolute", top: "8px", left: "8px", backgroundColor: "#e53e3e", color: "white", fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "10px" },
  cardOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" },
  overlayBtn: { backgroundColor: "white", color: "#2d3748", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" },
  cardBody: { padding: "14px" },
  catTag: { fontSize: "10px", color: "#38a169", fontWeight: "800", margin: "0 0 4px", letterSpacing: "1px" },
  cardTitle: { fontSize: "14px", fontWeight: "600", color: "#2d3748", margin: "0 0 8px", lineHeight: "1.4", minHeight: "38px" },
  cardMeta: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  stars: { fontSize: "11px" },
  stockTag: { fontSize: "11px", color: "#718096", backgroundColor: "#f7fafc", padding: "2px 7px", borderRadius: "6px", fontWeight: "600" },
  cardBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardPrice: { fontSize: "17px", fontWeight: "800", color: "#e53e3e" },
  cardBtns: { display: "flex", gap: "6px" },
  addCartBtn: { backgroundColor: "#f6ad55", color: "white", border: "none", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "700" },
  detailBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "700" },

  // List view
  listView: { display: "flex", flexDirection: "column", gap: "12px" },
  listCard: { backgroundColor: "white", borderRadius: "12px", padding: "16px", display: "flex", gap: "16px", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  listImg: { width: "100px", height: "100px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 },
  listInfo: { flex: 1 },
  listTitle: { fontSize: "16px", fontWeight: "600", color: "#2d3748", margin: "4px 0 8px" },
  listMeta: { display: "flex", alignItems: "center", gap: "10px" },
  listReview: { fontSize: "12px", color: "#718096" },
  listRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" },
  listPrice: { fontSize: "20px", fontWeight: "800", color: "#e53e3e" },
  listBtns: { display: "flex", gap: "8px" },

  // Empty
  empty: { textAlign: "center", padding: "80px 40px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  emptyTitle: { fontSize: "20px", fontWeight: "700", color: "#2d3748", margin: "16px 0 8px" },
  emptySub: { fontSize: "14px", color: "#718096", margin: "0 0 24px" },
  emptyBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "12px 28px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "700" },
  
};

export default Product;
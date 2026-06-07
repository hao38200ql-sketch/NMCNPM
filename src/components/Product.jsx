import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import db from "../database.json";

function Product() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const navigate = useNavigate();
  const { category } = useParams();
  const location = useLocation();
  const { addToCart } = useCart();
  const { t } = useLang();

  // Đọc search từ URL khi vào trang
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

  let products = category
    ? db.products.filter((p) => p.category === category)
    : [...db.products];

  // Lọc theo tìm kiếm
  if (search) {
    products = products.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Lọc theo giá
  products = products.filter(
    (p) => p.price >= minPrice && p.price <= maxPrice
  );

  // Sắp xếp
  if (sortBy === "title-az") products.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortBy === "title-za") products.sort((a, b) => b.title.localeCompare(a.title));
  else if (sortBy === "price-asc") products.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-desc") products.sort((a, b) => b.price - a.price);

  const pageTitle = search
    ? `🔍 Kết quả tìm kiếm: "${search}"`
    : category
    ? categoryNames[category]
    : `🏪 ${t.allProducts}`;

  const handleResetFilters = () => {
    setSearch("");
    setMinPrice(0);
    setMaxPrice(1000000);
    setSortBy("");
    navigate("/products");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.pageTitle}>{pageTitle}</h2>

        {/* Controls */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          {/* Price Filter */}
          <div style={styles.priceFilterContainer}>
            <div style={styles.priceInputGroup}>
              <label style={styles.priceLabel}>Từ:</label>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                placeholder="0"
                style={styles.priceInput}
              />
              <span style={styles.priceCurrency}>đ</span>
            </div>

            <div style={styles.priceInputGroup}>
              <label style={styles.priceLabel}>Đến:</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
                placeholder="1000000"
                style={styles.priceInput}
              />
              <span style={styles.priceCurrency}>đ</span>
            </div>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.select}
          >
            <option value="">{t.sortBy}</option>
            <option value="title-az">{t.titleAZ}</option>
            <option value="title-za">{t.titleZA}</option>
            <option value="price-asc">{t.priceLow}</option>
            <option value="price-desc">{t.priceHigh}</option>
          </select>

          <span style={styles.resultCount}>{products.length} {t.results}</span>

          {(search || minPrice > 0 || maxPrice < 1000000) && (
            <button style={styles.clearBtn} onClick={handleResetFilters}>
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "48px" }}>😔</p>
            <p style={{ fontSize: "18px", fontWeight: "600" }}>{t.noProduct}</p>
            <button
              style={styles.backBtn}
              onClick={handleResetFilters}
            >
              ← {t.allProducts}
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map((product) => (
              <div key={product.id} style={styles.card}>
                <div style={styles.imageBox}>
                  <img
                    src={product.image}
                    alt={product.title}
                    style={styles.img}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/200";
                    }}
                  />
                  {product.stock < 20 && (
                    <span style={styles.lowStock}>{t.almostOut}</span>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.category}>
                    {product.category.replace("-", " ").toUpperCase()}
                  </p>
                  <h3 style={styles.title}>{product.title}</h3>
                  <div style={styles.meta}>
                    <span style={styles.price}>
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
                    <span style={styles.stock}>
                      {t.remain} {product.stock}
                    </span>
                  </div>
                  <div style={styles.reviews}>
                    {"⭐".repeat(
                      Math.round(
                        product.reviews.reduce((s, r) => s + r.rating, 0) /
                          (product.reviews.length || 1)
                      )
                    )}
                    <span style={{ color: "#718096", fontSize: "12px", marginLeft: "4px" }}>
                      ({product.reviews.length})
                    </span>
                  </div>
                  <div style={styles.actions}>
                    <button
                      style={styles.cartBtn}
                      onClick={() => addToCart(product)}
                    >
                      {t.addCart}
                    </button>
                    <button
                      style={styles.detailBtn}
                      onClick={() => navigate(`/detail/${product.id}`)}
                    >
                      {t.detail}
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
  page: {
    backgroundColor: "#f7fafc",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 16px",
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#2d3748",
    marginBottom: "24px",
  },
  controls: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: "200px",
    padding: "10px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  priceFilterContainer: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: "8px 12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "white",
  },
  priceInputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  priceLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#4a5568",
    whiteSpace: "nowrap",
  },
  priceInput: {
    width: "85px",
    padding: "6px 8px",
    border: "1px solid #cbd5e0",
    borderRadius: "4px",
    fontSize: "13px",
    outline: "none",
  },
  priceCurrency: {
    fontSize: "12px",
    color: "#718096",
    fontWeight: "500",
  },
  select: {
    padding: "10px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    minWidth: "180px",
    cursor: "pointer",
    backgroundColor: "white",
    outline: "none",
  },
  resultCount: {
    color: "#718096",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  clearBtn: {
    backgroundColor: "#fed7d7",
    color: "#e53e3e",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  empty: {
    textAlign: "center",
    padding: "60px",
    color: "#718096",
  },
  backBtn: {
    backgroundColor: "#38a169",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "12px",
    transition: "all 0.2s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  imageBox: {
    height: "180px",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f0fff4",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  lowStock: {
    position: "absolute",
    top: "8px",
    right: "8px",
    backgroundColor: "#fc8181",
    color: "white",
    fontSize: "10px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "12px",
  },
  cardBody: {
    padding: "14px",
  },
  category: {
    fontSize: "10px",
    color: "#38a169",
    fontWeight: "700",
    margin: "0 0 4px",
    letterSpacing: "0.5px",
  },
  title: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2d3748",
    margin: "0 0 10px",
    lineHeight: "1.4",
    minHeight: "40px",
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  price: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#e53e3e",
  },
  stock: {
    fontSize: "11px",
    color: "#718096",
    backgroundColor: "#f7fafc",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  reviews: {
    fontSize: "12px",
    marginBottom: "12px",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  cartBtn: {
    flex: 1,
    backgroundColor: "#f6ad55",
    color: "white",
    border: "none",
    padding: "8px 0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  detailBtn: {
    flex: 1,
    backgroundColor: "#38a169",
    color: "white",
    border: "none",
    padding: "8px 0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
};

export default Product;
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import db from "../database.json";

function Home() {
  const navigate = useNavigate();
  const { t } = useLang();

  const categories = [
    { key: "ngu-coc", label: t.nguCoc, icon: "🌾", color: "#fef3c7" },
    { key: "banh-mi", label: t.banhMi, icon: "🍞", color: "#fde8d8" },
    { key: "sua-trung", label: t.suaTrung, icon: "🥛", color: "#e0f2fe" },
    { key: "thit", label: t.thit, icon: "🥩", color: "#fee2e2" },
    { key: "hai-san", label: t.haiSan, icon: "🦐", color: "#d1fae5" },
    { key: "rau-cu", label: t.rauCu, icon: "🥦", color: "#dcfce7" },
    { key: "trai-cay", label: t.traiCay, icon: "🍎", color: "#fce7f3" },
  ];

  const featured = db.products.slice(0, 8);

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>{t.heroTitle}</h1>
          <p style={styles.heroSub}>{t.heroSub}</p>
          <button style={styles.heroBtn} onClick={() => navigate("/products")}>
            {t.shopNow}
          </button>
        </div>
      </div>

      <div style={styles.container}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>{t.categoryTitle}</h2>
          <div style={styles.categoryGrid}>
            {categories.map((cat) => (
              <div key={cat.key} style={{ ...styles.categoryCard, backgroundColor: cat.color }}
                onClick={() => navigate(`/category/${cat.key}`)}>
                <span style={styles.categoryIcon}>{cat.icon}</span>
                <span style={styles.categoryLabel}>{cat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>{t.featuredTitle}</h2>
            <button style={styles.viewAll} onClick={() => navigate("/products")}>{t.viewAll}</button>
          </div>
          <div style={styles.productGrid}>
            {featured.map((product) => (
              <div key={product.id} style={styles.productCard}>
                <div style={styles.imageBox}>
                  <img src={product.image} alt={product.title} style={styles.productImg}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/200"; }} />
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.productCategory}>{product.category.replace("-", " ").toUpperCase()}</p>
                  <h3 style={styles.productName}>{product.title}</h3>
                  <div style={styles.cardFooter}>
                    <span style={styles.productPrice}>{product.price.toLocaleString("vi-VN")}đ</span>
                    <span style={styles.productStock}>{t.remain} {product.stock}</span>
                  </div>
                  <div style={styles.cardActions}>
                    <span style={styles.reviewCount}>⭐ {product.reviews.length} {t.reviews}</span>
                    <button style={styles.detailBtn} onClick={() => navigate(`/detail/${product.id}`)}>
                      {t.detail}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.promoBanner}>
          <div style={styles.promoLeft}>
            <h3 style={styles.promoTitle}>{t.freeShip}</h3>
            <p style={styles.promoText}>{t.freeShipSub}</p>
          </div>
          <div style={styles.promoLeft}>
            <h3 style={styles.promoTitle}>{t.freshGuarantee}</h3>
            <p style={styles.promoText}>{t.freshSub}</p>
          </div>
          <div style={styles.promoLeft}>
            <h3 style={styles.promoTitle}>{t.easyReturn}</h3>
            <p style={styles.promoText}>{t.easyReturnSub}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif" },
  hero: { background: "linear-gradient(135deg, #38a169 0%, #2f855a 100%)", padding: "60px 32px", textAlign: "center" },
  heroContent: { maxWidth: "600px", margin: "0 auto" },
  heroTitle: { color: "white", fontSize: "36px", fontWeight: "800", margin: "0 0 12px" },
  heroSub: { color: "#c6f6d5", fontSize: "16px", margin: "0 0 24px" },
  heroBtn: { backgroundColor: "#f6ad55", color: "white", border: "none", padding: "14px 32px", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" },
  section: { marginBottom: "48px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  sectionTitle: { fontSize: "22px", fontWeight: "700", color: "#2d3748", margin: "0 0 20px" },
  viewAll: { backgroundColor: "transparent", color: "#38a169", border: "2px solid #38a169", padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  categoryGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "12px" },
  categoryCard: { borderRadius: "12px", padding: "20px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  categoryIcon: { fontSize: "32px" },
  categoryLabel: { fontSize: "12px", fontWeight: "600", color: "#2d3748", textAlign: "center" },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
  productCard: { backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" },
  imageBox: { height: "160px", overflow: "hidden", backgroundColor: "#f0fff4" },
  productImg: { width: "100%", height: "100%", objectFit: "cover" },
  cardBody: { padding: "12px" },
  productCategory: { fontSize: "10px", color: "#38a169", fontWeight: "700", margin: "0 0 4px", letterSpacing: "0.5px" },
  productName: { fontSize: "14px", fontWeight: "600", color: "#2d3748", margin: "0 0 8px", lineHeight: "1.4" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  productPrice: { fontSize: "15px", fontWeight: "700", color: "#e53e3e" },
  productStock: { fontSize: "11px", color: "#718096", backgroundColor: "#f7fafc", padding: "2px 6px", borderRadius: "4px" },
  cardActions: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  reviewCount: { fontSize: "11px", color: "#718096" },
  detailBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  promoBanner: { backgroundColor: "white", borderRadius: "12px", padding: "24px 32px", display: "flex", justifyContent: "space-around", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" },
  promoLeft: { textAlign: "center" },
  promoTitle: { fontSize: "16px", fontWeight: "700", color: "#2d3748", margin: "0 0 4px" },
  promoText: { fontSize: "13px", color: "#718096", margin: 0 },
};

export default Home;
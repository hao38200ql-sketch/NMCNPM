import { useNavigate } from "react-router-dom";
import { useProduct } from "../context/ProductContext";
import { useCart } from "../context/CartContext";

function Home() {
  const navigate = useNavigate();
  const { products } = useProduct();
  const { addToCart } = useCart();

  const categories = [
    { key: "ngu-coc", label: "Ngũ Cốc", icon: "🌾", bg: "#fef3c7" },
    { key: "banh-mi", label: "Bánh Mì", icon: "🍞", bg: "#fde8d8" },
    { key: "sua-trung", label: "Sữa Trứng", icon: "🥛", bg: "#e0f2fe" },
    { key: "thit", label: "Thịt Tươi", icon: "🥩", bg: "#fee2e2" },
    { key: "hai-san", label: "Hải Sản", icon: "🦐", bg: "#fef9e7" },
    { key: "rau-cu", label: "Rau Củ", icon: "🥦", bg: "#dcfce7" },
    { key: "trai-cay", label: "Trái Cây", icon: "🍎", bg: "#fce7f3" },
    { key: "do-uong", label: "Đồ Uống", icon: "🥤", bg: "#ede9fe" },
  ];

  const featured = products.slice(0, 8);

  return (
    <div style={styles.page}>

      {/* ===== HERO BANNER ===== */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🌿 Tươi mỗi ngày - Giao tận nhà</div>
          <h1 style={styles.heroTitle}>
            Thực Phẩm Tươi Sạch <br />Cho Gia Đình Bạn
          </h1>
          <p style={styles.heroSub}>Cung cấp nguồn thực phẩm hữu cơ, tươi sạch và an toàn nhất cho bữa ăn hàng ngày.</p>
          <div style={styles.heroBtns}>
            <button style={styles.heroBtn} onClick={() => navigate("/products")}>
              🛒 Mua ngay
            </button>
            <button style={styles.heroBtn2} onClick={() => navigate("/category/trai-cay")}>
              🍎 Trái cây tươi
            </button>
          </div>
        </div>
        <div style={styles.heroImageBox}>
          <div style={styles.heroEmojiCircle}>🥗</div>
          <span style={styles.heroFloat1}>🥦</span>
          <span style={styles.heroFloat2}>🍎</span>
          <span style={styles.heroFloat3}>🥑</span>
          <span style={styles.heroFloat4}>🍇</span>
        </div>
      </div>

      {/* ===== PROMO STRIP ===== */}
      <div style={styles.promoStrip}>
        {[
          { icon: "🚚", title: "Miễn phí giao hàng", sub: "Đơn từ 200.000đ" },
          { icon: "✅", title: "Cam kết tươi sạch", sub: "100% chất lượng" },
          { icon: "🔄", title: "Đổi trả dễ dàng", sub: "Trong vòng 24 giờ" },
          { icon: "💳", title: "Thanh toán an toàn", sub: "COD & Online" },
        ].map((item, i) => (
          <div key={i} style={styles.promoItem}>
            <span style={styles.promoIcon}>{item.icon}</span>
            <div>
              <p style={styles.promoTitle}>{item.title}</p>
              <p style={styles.promoSub}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.container}>

        {/* ===== CATEGORIES ===== */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionTag}>KHÁM PHÁ</p>
              <h2 style={styles.sectionTitle}>Danh mục sản phẩm</h2>
            </div>
          </div>
          <div style={styles.categoryGrid}>
            {categories.map((cat) => (
              <div key={cat.key}
                style={{ ...styles.categoryCard, backgroundColor: cat.bg }}
                onClick={() => navigate(`/category/${cat.key}`)}>
                <span style={styles.categoryIcon}>{cat.icon}</span>
                <span style={styles.categoryLabel}>{cat.label}</span>
                <span style={styles.categoryArrow}>→</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== BANNER ROW ===== */}
        <div style={styles.bannerRow}>
          <div style={{ ...styles.miniBanner, background: "linear-gradient(135deg, #fb923c, #f97316)" }}
            onClick={() => navigate("/category/trai-cay")}>
            <div>
              <p style={styles.miniBannerTag}>HOT DEAL</p>
              <h3 style={styles.miniBannerTitle}>Trái Cây Tươi</h3>
              <p style={styles.miniBannerSub}>Nhập hàng mỗi ngày</p>
              <button style={styles.miniBannerBtn}>Xem ngay →</button>
            </div>
            <span style={{ fontSize: "64px" }}>🍎</span>
          </div>
          <div style={{ ...styles.miniBanner, background: "linear-gradient(135deg, #38bdf8, #2563eb)" }}
            onClick={() => navigate("/category/hai-san")}>
            <div>
              <p style={styles.miniBannerTag}>TƯƠI NGON</p>
              <h3 style={styles.miniBannerTitle}>Hải Sản Sạch</h3>
              <p style={styles.miniBannerSub}>Giao trong 2 giờ</p>
              <button style={styles.miniBannerBtn}>Xem ngay →</button>
            </div>
            <span style={{ fontSize: "64px" }}>🦐</span>
          </div>
          <div style={{ ...styles.miniBanner, background: "linear-gradient(135deg, #4ade80, #16a34a)" }}
            onClick={() => navigate("/category/rau-cu")}>
            <div>
              <p style={styles.miniBannerTag}>ORGANIC</p>
              <h3 style={styles.miniBannerTitle}>Rau Củ Sạch</h3>
              <p style={styles.miniBannerSub}>Từ nông trại đến bàn</p>
              <button style={styles.miniBannerBtn}>Xem ngay →</button>
            </div>
            <span style={{ fontSize: "64px" }}>🥦</span>
          </div>
        </div>

        {/* ===== LUCKY WHEEL BANNER (THÊM MỚI Ở ĐÂY) ===== */}
        <div 
          style={styles.luckyBanner} 
          onClick={() => navigate("/lucky-wheel")}
        >
          <div style={styles.luckyLeft}>
            <span style={{ fontSize: "48px", marginRight: "16px" }}>🎡</span>
            <div>
              <h3 style={styles.luckyTitle}>Vòng Quay May Mắn Tuần Này!</h3>
              <p style={styles.luckySub}>Cơ hội trúng Voucher 200K và mã giảm 30%. Dành riêng cho khách có đơn hàng.</p>
            </div>
          </div>
          <button style={styles.luckyBtn}>Quay Thưởng Ngay →</button>
        </div>

        {/* ===== FEATURED PRODUCTS ===== */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionTag}>NỔI BẬT</p>
              <h2 style={styles.sectionTitle}>Sản phẩm nổi bật</h2>
            </div>
            <button style={styles.viewAll} onClick={() => navigate("/products")}>
              Xem tất cả
            </button>
          </div>
          <div style={styles.productGrid}>
            {featured.map((product) => (
              <div key={product.id} style={styles.productCard}>
                <div style={styles.imageBox}>
                  <img src={product.image} alt={product.title} style={styles.productImg}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/200"; }} />
                  {product.stock < 20 && (
                    <span style={styles.hotBadge}>🔥 Sắp hết</span>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.productCategory}>
                    {product.category.replace("-", " ").toUpperCase()}
                  </p>
                  <h3 style={styles.productName}>{product.title}</h3>
                  <div style={styles.cardMeta}>
                    <div style={styles.ratingRow}>
                      {"⭐".repeat(Math.round(
                        product.reviews.reduce((s, r) => s + r.rating, 0) / (product.reviews.length || 1)
                      ))}
                      <span style={styles.reviewCount}>({product.reviews.length})</span>
                    </div>
                    <span style={styles.stockTag}>Còn {product.stock}</span>
                  </div>
                  <div style={styles.cardFooter}>
                    <span style={styles.productPrice}>
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div style={styles.cardActions}>
                    <button style={styles.cartBtn} onClick={() => addToCart(product)}>
                      🛒 Thêm
                    </button>
                    <button style={styles.detailBtn}
                      onClick={() => navigate(`/detail/${product.id}`)}>
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CTA BANNER ===== */}
        <div style={styles.ctaBanner}>
          <div style={styles.ctaLeft}>
            <h2 style={styles.ctaTitle}>🎁 Ưu đãi đặc biệt hôm nay!</h2>
            <p style={styles.ctaSub}>Đăng ký thành viên để nhận ngay voucher 50.000đ cho đơn hàng đầu tiên</p>
            <button style={styles.ctaBtn} onClick={() => navigate("/login")}>
              Đăng ký ngay →
            </button>
          </div>
          <div style={styles.ctaRight}>
            <span style={{ fontSize: "80px" }}>🎉</span>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#ffffff", minHeight: "100vh", fontFamily: "sans-serif" },

  // Hero
  hero: {
    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 60%, #f0fdfa 100%)",
    padding: "64px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "48px",
    flexWrap: "wrap",
    position: "relative",
    overflow: "hidden",
  },
  heroContent: { maxWidth: "560px", position: "relative", zIndex: 1 },
  heroBadge: {
    display: "inline-block",
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    padding: "8px 18px",
    borderRadius: "30px",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "20px",
    letterSpacing: "0.5px",
  },
  heroTitle: { color: "#14532d", fontSize: "44px", fontWeight: "900", margin: "0 0 16px", lineHeight: "1.25" },
  heroSub: { color: "#4b5563", fontSize: "16px", margin: "0 0 28px", lineHeight: "1.6" },
  heroBtns: { display: "flex", gap: "12px", flexWrap: "wrap" },
  heroBtn: {
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    padding: "15px 32px",
    borderRadius: "999px",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(22,163,74,0.35)",
    letterSpacing: "0.3px",
  },
  heroBtn2: {
    backgroundColor: "white",
    color: "#16a34a",
    border: "2px solid #bbf7d0",
    padding: "15px 32px",
    borderRadius: "999px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  heroImageBox: {
    position: "relative",
    width: "320px",
    height: "320px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroEmojiCircle: {
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    backgroundColor: "white",
    boxShadow: "0 12px 40px rgba(22,163,74,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "100px",
  },
  heroFloat1: { position: "absolute", top: "5%", left: "0%", fontSize: "44px", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.1))" },
  heroFloat2: { position: "absolute", top: "10%", right: "0%", fontSize: "40px", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.1))" },
  heroFloat3: { position: "absolute", bottom: "8%", left: "5%", fontSize: "44px", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.1))" },
  heroFloat4: { position: "absolute", bottom: "0%", right: "10%", fontSize: "40px", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.1))" },

  // Promo strip
  promoStrip: {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "space-around",
    padding: "20px 32px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    borderBottom: "1px solid #f3f4f6",
    flexWrap: "wrap",
    gap: "12px",
  },
  promoItem: { display: "flex", alignItems: "center", gap: "12px", padding: "8px 16px" },
  promoIcon: { fontSize: "28px" },
  promoTitle: { fontSize: "14px", fontWeight: "700", color: "#1f2937", margin: 0 },
  promoSub: { fontSize: "12px", color: "#9ca3af", margin: 0 },

  // Container
  container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 16px" },
  section: { marginBottom: "56px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" },
  sectionTag: { fontSize: "11px", fontWeight: "800", color: "#16a34a", letterSpacing: "2px", margin: "0 0 4px" },
  sectionTitle: { fontSize: "24px", fontWeight: "800", color: "#1f2937", margin: 0 },
  viewAll: {
    backgroundColor: "transparent",
    color: "#16a34a",
    border: "2px solid #16a34a",
    padding: "8px 20px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },

  // Categories
  categoryGrid: { display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "12px" },
  categoryCard: {
    borderRadius: "16px",
    padding: "22px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "transform 0.15s",
  },
  categoryIcon: { fontSize: "34px" },
  categoryLabel: { fontSize: "12px", fontWeight: "700", color: "#1f2937", textAlign: "center" },
  categoryArrow: { fontSize: "12px", color: "#9ca3af" },

  // Mini banners
  bannerRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" },
  miniBanner: {
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    overflow: "hidden",
    position: "relative",
  },
  miniBannerTag: { fontSize: "10px", fontWeight: "800", color: "rgba(255,255,255,0.85)", letterSpacing: "2px", margin: "0 0 6px" },
  miniBannerTitle: { fontSize: "20px", fontWeight: "800", color: "white", margin: "0 0 4px" },
  miniBannerSub: { fontSize: "12px", color: "rgba(255,255,255,0.85)", margin: "0 0 14px" },
  miniBannerBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.5)",
    padding: "7px 16px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  // THÊM: Banner Vòng quay
  luckyBanner: {
    background: "linear-gradient(135deg, #e53e3e, #c53030)",
    borderRadius: "16px",
    padding: "24px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(229,62,62,0.3)",
    marginBottom: "56px",
    color: "white",
    flexWrap: "wrap",
    gap: "16px"
  },
  luckyLeft: { display: "flex", alignItems: "center" },
  luckyTitle: { fontSize: "22px", fontWeight: "800", margin: "0 0 6px" },
  luckySub: { fontSize: "14px", margin: 0, opacity: 0.9 },
  luckyBtn: { 
    backgroundColor: "white", color: "#c53030", border: "none", 
    padding: "12px 24px", borderRadius: "8px", fontWeight: "800", 
    fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
  },

  // Products
  productGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" },
  productCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #f3f4f6",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  imageBox: { height: "180px", overflow: "hidden", backgroundColor: "#f0fdf4", position: "relative" },
  productImg: { width: "100%", height: "100%", objectFit: "cover" },
  hotBadge: {
    position: "absolute", top: "8px", left: "8px",
    backgroundColor: "#ef4444", color: "white",
    fontSize: "10px", fontWeight: "700",
    padding: "3px 8px", borderRadius: "10px",
  },
  cardBody: { padding: "14px" },
  productCategory: { fontSize: "10px", color: "#16a34a", fontWeight: "800", margin: "0 0 4px", letterSpacing: "1px" },
  productName: { fontSize: "14px", fontWeight: "600", color: "#1f2937", margin: "0 0 8px", lineHeight: "1.4", minHeight: "38px" },
  cardMeta: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  ratingRow: { fontSize: "11px" },
  reviewCount: { fontSize: "11px", color: "#9ca3af", marginLeft: "4px" },
  stockTag: { fontSize: "11px", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 7px", borderRadius: "6px", fontWeight: "600" },
  cardFooter: { marginBottom: "10px" },
  productPrice: { fontSize: "18px", fontWeight: "800", color: "#16a34a" },
  cardActions: { display: "flex", gap: "8px" },
  cartBtn: {
    flex: 1, backgroundColor: "#fb923c", color: "white",
    border: "none", padding: "9px 0", borderRadius: "999px",
    cursor: "pointer", fontSize: "12px", fontWeight: "700",
  },
  detailBtn: {
    flex: 1, backgroundColor: "#16a34a", color: "white",
    border: "none", padding: "9px 0", borderRadius: "999px",
    cursor: "pointer", fontSize: "12px", fontWeight: "700",
  },

  // CTA Banner
  ctaBanner: {
    background: "linear-gradient(135deg, #16a34a, #0dcc53)",
    borderRadius: "20px",
    padding: "40px 48px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 8px 32px rgba(22,163,74,0.25)",
    flexWrap: "wrap",
    gap: "20px",
  },
  ctaLeft: { flex: 1, minWidth: "240px" },
  ctaTitle: { fontSize: "26px", fontWeight: "800", color: "white", margin: "0 0 10px" },
  ctaSub: { fontSize: "15px", color: "#dcfce7", margin: "0 0 24px", lineHeight: "1.6" },
  ctaBtn: {
    backgroundColor: "white", color: "#16a34a",
    border: "none", padding: "14px 32px",
    borderRadius: "999px", fontSize: "15px",
    fontWeight: "800", cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  },
  ctaRight: { flexShrink: 0, marginLeft: "32px" },
};

export default Home;
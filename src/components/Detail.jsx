import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import db from "../database.json";

function Detail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const product = db.products.find((p) => String(p.id) === String(id));
  const [reviews, setReviews] = useState(product ? product.reviews : []);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("5");
  const [message, setMessage] = useState("");

  if (!product) return (
    <div style={styles.notFound}>
      <p style={{ fontSize: "48px" }}>😔</p>
      <p>Không tìm thấy sản phẩm</p>
      <button style={styles.backBtn} onClick={() => navigate("/")}>← Về trang chủ</button>
    </div>
  );

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleAddToCart = () => {
    addToCart(product);
    setMessage("✅ Đã thêm vào giỏ hàng!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddReview = () => {
    if (!name.trim() || !comment.trim()) return;
    const newReview = {
      reviewerName: name,
      comment,
      rating: Number(rating),
      date: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
    setName("");
    setComment("");
    setRating("5");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <span style={styles.breadLink} onClick={() => navigate("/")}>Trang chủ</span>
          <span> / </span>
          <span style={styles.breadLink} onClick={() => navigate("/products")}>Sản phẩm</span>
          <span> / </span>
          <span style={{ color: "#2d3748" }}>{product.title}</span>
        </div>

        {message && <div style={styles.alert}>{message}</div>}

        {/* Product Section */}
        <div style={styles.productSection}>
          <div style={styles.imageBox}>
            <img
              src={product.image}
              alt={product.title}
              style={styles.productImg}
              onError={(e) => { e.target.src = "https://via.placeholder.com/400"; }}
            />
          </div>
          <div style={styles.productInfo}>
            <p style={styles.category}>{product.category.replace("-", " ").toUpperCase()}</p>
            <h1 style={styles.productName}>{product.title}</h1>
            <div style={styles.ratingRow}>
              <span style={styles.stars}>{"⭐".repeat(Math.round(avgRating))}</span>
              <span style={styles.ratingText}>{avgRating} ({reviews.length} đánh giá)</span>
            </div>
            <div style={styles.priceBox}>
              <span style={styles.price}>{product.price.toLocaleString("vi-VN")}đ</span>
            </div>
            <div style={styles.infoRow}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Danh mục</span>
                <span style={styles.infoValue}>{product.category}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Tồn kho</span>
                <span style={{
                  ...styles.infoValue,
                  color: product.stock > 20 ? "#38a169" : "#e53e3e",
                  fontWeight: "700",
                }}>
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
                </span>
              </div>
            </div>
            <div style={styles.btnGroup}>
              <button
                style={product.stock > 0 ? styles.addCartBtn : styles.disabledBtn}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                🛒 Thêm vào giỏ hàng
              </button>
              <button style={styles.buyNowBtn} onClick={() => { addToCart(product); navigate("/cart"); }}>
                ⚡ Mua ngay
              </button>
            </div>
          </div>

          {/* Review Form */}
          <div style={styles.reviewForm}>
            <h3 style={styles.formTitle}>✍️ Viết đánh giá</h3>
            <input
              type="text"
              placeholder="Tên của bạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
            <textarea
              placeholder="Nội dung đánh giá..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={styles.textarea}
              rows={3}
            />
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              style={styles.select}
            >
              <option value="5">⭐⭐⭐⭐⭐ 5 sao</option>
              <option value="4">⭐⭐⭐⭐ 4 sao</option>
              <option value="3">⭐⭐⭐ 3 sao</option>
              <option value="2">⭐⭐ 2 sao</option>
              <option value="1">⭐ 1 sao</option>
            </select>
            <button onClick={handleAddReview} style={styles.submitReviewBtn}>
              Gửi đánh giá
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div style={styles.reviewsSection}>
          <h2 style={styles.reviewsTitle}>💬 Đánh giá từ khách hàng ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p style={styles.noReview}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          ) : (
            <div style={styles.reviewsList}>
              {reviews.map((r, i) => (
                <div key={i} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <div style={styles.avatar}>
                      {r.reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={styles.reviewerName}>{r.reviewerName}</p>
                      <p style={styles.reviewDate}>
                        {new Date(r.date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <span style={styles.reviewRating}>
                      {"⭐".repeat(r.rating)} {r.rating}/5
                    </span>
                  </div>
                  <p style={styles.reviewComment}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" },
  notFound: { textAlign: "center", padding: "80px", color: "#718096" },
  backBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginTop: "16px" },
  breadcrumb: { fontSize: "13px", color: "#718096", marginBottom: "20px" },
  breadLink: { color: "#38a169", cursor: "pointer", fontWeight: "500" },
  alert: {
    backgroundColor: "#c6f6d5",
    color: "#276749",
    border: "1px solid #9ae6b4",
    borderRadius: "8px",
    padding: "12px 20px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },
  productSection: { display: "flex", gap: "24px", marginBottom: "40px", flexWrap: "wrap" },
  imageBox: {
    width: "320px",
    height: "320px",
    borderRadius: "16px",
    overflow: "hidden",
    flexShrink: 0,
    backgroundColor: "#f0fff4",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  },
  productImg: { width: "100%", height: "100%", objectFit: "cover" },
  productInfo: { flex: 1, minWidth: "260px" },
  category: { fontSize: "12px", color: "#38a169", fontWeight: "700", letterSpacing: "1px", margin: "0 0 8px" },
  productName: { fontSize: "26px", fontWeight: "800", color: "#2d3748", margin: "0 0 12px", lineHeight: "1.3" },
  ratingRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
  stars: { fontSize: "16px" },
  ratingText: { color: "#718096", fontSize: "14px" },
  priceBox: { backgroundColor: "#fff5f5", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", display: "inline-block" },
  price: { fontSize: "28px", fontWeight: "800", color: "#e53e3e" },
  infoRow: { display: "flex", gap: "24px", marginBottom: "20px" },
  infoItem: { display: "flex", flexDirection: "column", gap: "4px" },
  infoLabel: { fontSize: "12px", color: "#718096" },
  infoValue: { fontSize: "14px", color: "#2d3748", fontWeight: "600" },
  btnGroup: { display: "flex", gap: "12px", flexWrap: "wrap" },
  addCartBtn: {
    backgroundColor: "#f6ad55",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  disabledBtn: {
    backgroundColor: "#e2e8f0",
    color: "#a0aec0",
    border: "none",
    padding: "14px 24px",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "not-allowed",
  },
  buyNowBtn: {
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  reviewForm: {
    width: "280px",
    flexShrink: 0,
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignSelf: "flex-start",
  },
  formTitle: { fontSize: "16px", fontWeight: "700", color: "#2d3748", margin: 0 },
  input: { padding: "10px 12px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" },
  textarea: { padding: "10px 12px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "sans-serif" },
  select: { padding: "10px 12px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", backgroundColor: "white" },
  submitReviewBtn: {
    backgroundColor: "#38a169",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  reviewsSection: { backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  reviewsTitle: { fontSize: "20px", fontWeight: "700", color: "#2d3748", marginBottom: "20px" },
  noReview: { color: "#718096", textAlign: "center", padding: "20px" },
  reviewsList: { display: "flex", flexDirection: "column", gap: "16px" },
  reviewCard: { backgroundColor: "#f7fafc", borderRadius: "12px", padding: "16px" },
  reviewHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#38a169",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },
  reviewerName: { fontWeight: "600", fontSize: "14px", color: "#2d3748", margin: 0 },
  reviewDate: { fontSize: "12px", color: "#a0aec0", margin: 0 },
  reviewRating: { marginLeft: "auto", fontSize: "13px", fontWeight: "600", color: "#744210" },
  reviewComment: { fontSize: "14px", color: "#4a5568", margin: 0, lineHeight: "1.6" },
};

export default Detail;
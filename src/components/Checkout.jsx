import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { useVoucher } from "../context/VoucherContext";
import { useNotification } from "../context/NotificationContext"; // Kéo context thông báo

export default function Checkout() {
  const { user, updateProfile } = useAuth();
  const { vouchers, getUserVouchers, validateVoucher, applyVoucher, addPointsAndSpend } = useVoucher();
  const { addNotification } = useNotification();
  
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherResult, setVoucherResult] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState("profile");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    id: null, type: "home", name: "", phone: "", address: "", ward: "", district: "", city: "", isDefault: false,
  });
  const [savedAddresses, setSavedAddresses] = useState(user?.savedAddresses || []);
  const [currentAddress, setCurrentAddress] = useState({
    name: user?.name || "", phone: user?.soDienThoai || "", address: user?.diaChi || "",
  });
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const { cartItems, clearCart } = useCart();
  const { addOrder } = useOrder();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total >= 200000 ? 0 : 30000;
  const grandTotal = total + shipping;

  const myVouchers = (getUserVouchers(user?.id) || [])
    .filter((uv) => !uv.used)
    .map((uv) => vouchers.find((v) => v.id === uv.voucherId))
    .filter(Boolean);

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) return;
    const result = validateVoucher(voucherCode.trim().toUpperCase(), total, user?.id);
    setVoucherResult(result);
    setSelectedVoucherId(null);
    if (result.valid) setDiscount(result.discount);
    else setDiscount(0);
  };

  const handleSelectVoucher = (voucher) => {
    if (selectedVoucherId === voucher.id) {
      setSelectedVoucherId(null);
      setVoucherResult(null);
      setVoucherCode("");
      setDiscount(0);
      return;
    }
    const result = validateVoucher(voucher.code, total, user?.id);
    setVoucherResult(result);
    setVoucherCode(voucher.code);
    setSelectedVoucherId(voucher.id);
    if (result.valid) setDiscount(result.discount);
    else setDiscount(0);
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
    if (addressId === "profile") {
      setCurrentAddress({ name: user?.name || "", phone: user?.soDienThoai || "", address: user?.diaChi || "" });
    } else {
      const addr = savedAddresses.find((a) => a.id === addressId);
      if (addr) setCurrentAddress({ name: addr.name, phone: addr.phone, address: `${addr.address}, ${addr.ward}, ${addr.district}, ${addr.city}` });
    }
  };

  const handleSaveNewAddress = () => {
    if (!newAddress.name.trim() || !newAddress.phone.trim() || !newAddress.address.trim() || !newAddress.district.trim() || !newAddress.city.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!"); return;
    }
    const address = { id: Date.now().toString(), ...newAddress };
    setSavedAddresses((prev) => [...prev, address]);
    updateProfile({ ...user, savedAddresses: [...savedAddresses, address] });
    setCurrentAddress({ name: address.name, phone: address.phone, address: `${address.address}, ${address.ward}, ${address.district}, ${address.city}` });
    setSelectedAddressId(address.id);
    setShowAddressForm(false);
    setNewAddress({ id: null, type: "home", name: "", phone: "", address: "", ward: "", district: "", city: "", isDefault: false });
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      setSavedAddresses((prev) => prev.filter((a) => a.id !== addressId));
      updateProfile({ ...user, savedAddresses: savedAddresses.filter((a) => a.id !== addressId) });
      if (selectedAddressId === addressId) {
        setSelectedAddressId("profile");
        handleSelectAddress("profile");
      }
    }
  };

  const handleConfirm = () => {
    if (!currentAddress.name.trim() || !currentAddress.phone.trim() || !currentAddress.address.trim()) {
      alert("Vui lòng chọn hoặc nhập địa chỉ giao hàng!"); return;
    }

    if (voucherResult?.valid) applyVoucher(voucherCode, user?.id);
    
    let updatedUser = { ...user };
    let gotSpin = false;

    if (total >= 200000) {
      updatedUser.spinCount = (updatedUser.spinCount || 0) + 1;
      gotSpin = true;
    }

    if (user) {
      updateProfile(updatedUser);
      addPointsAndSpend(user.id, grandTotal - discount);
    }

    const id = addOrder({
      cartItems, total, shipping, discount, name: currentAddress.name, phone: currentAddress.phone, address: currentAddress.address, note, userId: user?.id, email: user?.email,
    });
    
    setOrderId(id);
    clearCart();
    setSuccess(true);

    addNotification(`✅ Bạn đã đặt hàng thành công mã đơn #${id.slice(-6).toUpperCase()}`);
    if (gotSpin) {
      addNotification(`🎁 Bạn vừa nhận được 1 lượt quay may mắn từ đơn hàng #${id.slice(-6).toUpperCase()}!`);
    }
  };

  if (success)
    return (
      <div style={styles.successPage}>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.successTitle}>Đặt hàng thành công!</h2>
          <div style={styles.orderIdBadge}>
            <span style={styles.orderIdLabel}>Mã đơn hàng</span>
            <span style={styles.orderIdValue}>{orderId}</span>
          </div>
          <p style={styles.successText}>Cảm ơn bạn đã mua sắm tại FoodMart.</p>
          <p style={styles.successText}>
            Đơn hàng sẽ được giao trong <span style={{ fontWeight: "700", color: "#38a169" }}>2-4 giờ</span>
          </p>
          
          {total >= 200000 && (
            <div style={{ backgroundColor: "#fff5f5", border: "1px dashed #e53e3e", color: "#e53e3e", padding: "10px", borderRadius: "8px", margin: "16px 0", fontSize: "14px", fontWeight: "700" }}>
              🎉 Chúc mừng bạn nhận được 1 lượt quay may mắn!
            </div>
          )}

          <div style={styles.deliveryInfo}>
            <div style={styles.deliveryItem}><span style={{ fontSize: "24px" }}>📍</span><span style={styles.deliveryText}>{currentAddress.address}</span></div>
            <div style={styles.deliveryItem}><span style={{ fontSize: "24px" }}>📞</span><span style={styles.deliveryText}>{currentAddress.phone}</span></div>
          </div>
          <div style={styles.successBtns}>
            {total >= 200000 && (
              <button style={{...styles.viewOrderBtn, backgroundColor: "#e53e3e", marginBottom: "8px"}} onClick={() => navigate("/lucky-wheel")}>
                🎁 Đi tới Vòng Quay May Mắn
              </button>
            )}
            <button style={styles.viewOrderBtn} onClick={() => navigate("/order")}>📋 Xem lịch sử đơn hàng</button>
            <button style={styles.homeBtn} onClick={() => navigate("/")}>🏠 Về trang chủ</button>
          </div>
        </div>
      </div>
    );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.pageTitle}>💳 Thanh Toán</h2>

        <div style={styles.layout}>
          <div style={styles.formBox}>
            <div style={styles.section}>
              <div style={styles.sectionHeader}><h3 style={styles.sectionTitle}>📍 Địa chỉ giao hàng</h3></div>
              <div style={{ ...styles.addressCard, ...(selectedAddressId === "profile" ? styles.addressCardSelected : {}), }} onClick={() => handleSelectAddress("profile")}>
                <div style={styles.addressCardContent}>
                  <div style={styles.addressTypeIcon}>👤</div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.addressTitle}>Địa chỉ từ hồ sơ</p>
                    <p style={styles.addressDetail}>{user?.name}</p>
                    <p style={styles.addressDetail}>{user?.soDienThoai}</p>
                    <p style={styles.addressDetailFull}>{user?.diaChi || "Chưa cập nhật"}</p>
                  </div>
                  <div style={styles.addressCheck}>{selectedAddressId === "profile" && <span style={styles.checkMark}>✓</span>}</div>
                </div>
              </div>

              {savedAddresses.length > 0 && (
                <div style={styles.savedAddressesSection}>
                  <p style={styles.savedAddressesLabel}>Địa chỉ đã lưu</p>
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} style={{ ...styles.addressCard, ...(selectedAddressId === addr.id ? styles.addressCardSelected : {}), }} onClick={() => handleSelectAddress(addr.id)}>
                      <div style={styles.addressCardContent}>
                        <div style={{ ...styles.addressTypeIcon, fontSize: "16px" }}>{addr.type === "home" ? "🏠" : addr.type === "office" ? "🏢" : "📍"}</div>
                        <div style={{ flex: 1 }}>
                          <p style={styles.addressTitle}>{addr.name}</p>
                          <p style={styles.addressDetail}>{addr.phone}</p>
                          <p style={styles.addressDetailFull}>{addr.address}, {addr.ward}, {addr.district}, {addr.city}</p>
                        </div>
                        <button style={styles.deleteAddressBtn} onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}>🗑️</button>
                        <div style={styles.addressCheck}>{selectedAddressId === addr.id && <span style={styles.checkMark}>✓</span>}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button style={styles.addNewAddressBtn} onClick={() => setShowAddressForm(!showAddressForm)}>
                {showAddressForm ? "✕ Hủy" : "+ Thêm địa chỉ mới"}
              </button>

              {showAddressForm && (
                <div style={styles.addressForm}>
                  <h4 style={styles.formTitle}>Thêm địa chỉ mới</h4>
                  <div style={styles.typeSelector}>
                    {[ { value: "home", label: "🏠 Nhà" }, { value: "office", label: "🏢 Văn phòng" }, { value: "other", label: "📍 Khác" },].map((type) => (
                      <button key={type.value} style={{ ...styles.typeBtn, ...(newAddress.type === type.value ? styles.typeBtnActive : {}), }} onClick={() => setNewAddress((prev) => ({ ...prev, type: type.value }))}>{type.label}</button>
                    ))}
                  </div>

                  <div style={styles.formGrid}>
                    <div style={{ ...styles.formField, gridColumn: "1 / -1" }}><label style={styles.formLabel}>Tên địa chỉ *</label><input style={styles.formInput} placeholder="VD: Nhà riêng, Văn phòng..." value={newAddress.name} onChange={(e) => setNewAddress((prev) => ({ ...prev, name: e.target.value }))} /></div>
                    <div style={styles.formField}><label style={styles.formLabel}>Số điện thoại *</label><input style={styles.formInput} placeholder="0901234567" value={newAddress.phone} onChange={(e) => setNewAddress((prev) => ({ ...prev, phone: e.target.value }))} /></div>
                    <div style={styles.formField}><label style={styles.formLabel}>Tỉnh/Thành phố *</label><input style={styles.formInput} placeholder="Hà Nội" value={newAddress.city} onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))} /></div>
                    <div style={styles.formField}><label style={styles.formLabel}>Quận/Huyện *</label><input style={styles.formInput} placeholder="Ba Đình" value={newAddress.district} onChange={(e) => setNewAddress((prev) => ({ ...prev, district: e.target.value }))} /></div>
                    <div style={styles.formField}><label style={styles.formLabel}>Phường/Xã</label><input style={styles.formInput} placeholder="Cát Linh" value={newAddress.ward} onChange={(e) => setNewAddress((prev) => ({ ...prev, ward: e.target.value }))} /></div>
                    <div style={{ ...styles.formField, gridColumn: "1 / -1" }}><label style={styles.formLabel}>Số nhà, tên đường *</label><textarea style={styles.formTextarea} placeholder="Số 123 Đường Tây Sơn" value={newAddress.address} onChange={(e) => setNewAddress((prev) => ({ ...prev, address: e.target.value }))} rows={2} /></div>
                  </div>
                  <button style={styles.saveAddressBtn} onClick={handleSaveNewAddress}>💾 Lưu địa chỉ</button>
                </div>
              )}
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🚚 Thông tin giao hàng</h3>
              <div style={styles.deliveryPreview}>
                <div style={styles.previewRow}><span style={styles.previewLabel}>Người nhận:</span><span style={styles.previewValue}>{currentAddress.name || "—"}</span></div>
                <div style={styles.previewRow}><span style={styles.previewLabel}>Số điện thoại:</span><span style={styles.previewValue}>{currentAddress.phone || "—"}</span></div>
                <div style={styles.previewRow}><span style={styles.previewLabel}>Địa chỉ:</span><span style={styles.previewValue}>{currentAddress.address || "—"}</span></div>
              </div>
              <div style={styles.field}><label style={styles.label}>Ghi chú đơn hàng</label><textarea placeholder="Ghi chú giao hàng (VD: giao lúc nào, để ở đâu...)" value={note} onChange={(e) => setNote(e.target.value)} style={styles.textarea} rows={3} /></div>

              {myVouchers.length > 0 && (
                <div style={styles.field}>
                  <label style={styles.label}>🎁 Voucher của bạn ({myVouchers.length})</label>
                  <div style={styles.voucherList}>
                    {myVouchers.map((voucher) => {
                      const eligible = total >= voucher.minOrder;
                      const isSelected = selectedVoucherId === voucher.id;
                      return (
                        <div key={voucher.id} onClick={() => eligible && handleSelectVoucher(voucher)} style={{ ...styles.voucherOption, ...(isSelected ? styles.voucherOptionSelected : {}), ...(eligible ? {} : styles.voucherOptionDisabled), }}>
                          <span style={styles.voucherOptionIcon}>{voucher.icon}</span>
                          <div style={{ flex: 1 }}>
                            <p style={styles.voucherOptionName}>{voucher.name}</p>
                            <p style={styles.voucherOptionDesc}>{voucher.description}</p>
                            {!eligible && <p style={styles.voucherOptionWarn}>Cần đơn từ {voucher.minOrder.toLocaleString("vi-VN")}đ</p>}
                          </div>
                          <div style={{ ...styles.voucherRadio, ...(isSelected ? styles.voucherRadioSelected : {}), }}>{isSelected && "✓"}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>🎫 Nhập mã voucher khác</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="text" placeholder="Nhập mã voucher..." value={voucherCode} onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setSelectedVoucherId(null); }} style={{ ...styles.input, letterSpacing: "1px", fontWeight: "600" }} />
                  <button type="button" onClick={handleApplyVoucher} style={{ backgroundColor: "#f6ad55", color: "white", border: "none", padding: "0 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", whiteSpace: "nowrap" }}>Áp dụng</button>
                </div>
                {voucherResult && (
                  <div style={{ marginTop: "8px", padding: "10px 14px", borderRadius: "8px", backgroundColor: voucherResult.valid ? "#f0fff4" : "#fff5f5", color: voucherResult.valid ? "#276749" : "#c53030", fontSize: "13px", fontWeight: "600", border: `1px solid ${voucherResult.valid ? "#68d391" : "#fc8181"}`, }}>
                    {voucherResult.valid ? "✅" : "❌"} {voucherResult.message}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💵 Phương thức thanh toán</h3>
              <div style={styles.paymentOption}>
                <input type="radio" id="cod" defaultChecked />
                <label htmlFor="cod" style={styles.paymentLabel}>
                  <span style={{ fontSize: "18px" }}>💵</span>
                  <span>
                    <p style={{ margin: "0 0 2px", fontWeight: "700" }}>Thanh toán khi nhận hàng (COD)</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#718096" }}>An toàn, không phí phát sinh</p>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div style={styles.summary}>
            <h3 style={styles.summaryTitle}>🧾 Tóm tắt đơn hàng</h3>
            <div style={styles.orderList}>
              {cartItems.map((item) => (
                <div key={item.id} style={styles.orderItem}>
                  <img src={item.image} alt={item.title} style={styles.orderImg} onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }} />
                  <div style={{ flex: 1 }}><p style={styles.orderName}>{item.title}</p><p style={styles.orderQty}>x{item.quantity}</p></div>
                  <span style={styles.orderPrice}>{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
                </div>
              ))}
            </div>

            <div style={styles.divider} />

            <div style={styles.pricingBox}>
              <div style={styles.pricingRow}><span style={styles.pricingLabel}>Tạm tính:</span><span style={styles.pricingValue}>{total.toLocaleString("vi-VN")}đ</span></div>
              <div style={styles.pricingRow}><span style={styles.pricingLabel}>Phí giao hàng:</span><span style={{ ...styles.pricingValue, color: "#38a169", fontWeight: "700" }}>{shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString("vi-VN")}đ`}</span></div>
              {total < 200000 && shipping > 0 && <div style={styles.freeShipHint}><p style={{ margin: 0, fontSize: "12px", color: "#f6ad55", fontWeight: "700" }}>🎁 Mua thêm {(200000 - total).toLocaleString("vi-VN")}đ để được miễn phí giao hàng!</p></div>}
              {discount > 0 && <div style={styles.pricingRow}><span style={{ color: "#38a169" }}>Giảm voucher:</span><span style={{ color: "#38a169", fontWeight: "700" }}>-{discount.toLocaleString("vi-VN")}đ</span></div>}
              <div style={styles.divider} />
              <div style={styles.totalSection}><span style={styles.totalLabel}>Tổng cộng:</span><span style={styles.totalPrice}>{(grandTotal - discount).toLocaleString("vi-VN")}đ</span></div>
            </div>

            <div style={styles.actionButtons}>
              <button style={styles.confirmBtn} onClick={handleConfirm}>✅ Xác nhận đặt hàng</button>
              <button style={styles.backBtn} onClick={() => navigate("/cart")}>← Quay lại giỏ hàng</button>
            </div>
            <div style={styles.trustBadges}>
              <div style={styles.trustBadge}><span>✅</span><span>Thanh toán an toàn</span></div>
              <div style={styles.trustBadge}><span>🚚</span><span>Giao hàng nhanh</span></div>
              <div style={styles.trustBadge}><span>🔄</span><span>Đổi trả dễ</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: "40px" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" },
  pageTitle: { fontSize: "28px", fontWeight: "800", color: "#2d3748", marginBottom: "32px" },
  layout: { display: "flex", gap: "28px", alignItems: "flex-start", flexWrap: "wrap" },
  formBox: { flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "24px" },
  section: { backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#2d3748", margin: 0 },
  addressCard: { padding: "16px", border: "2px solid #e2e8f0", borderRadius: "12px", backgroundColor: "white", cursor: "pointer", marginBottom: "12px", transition: "all 0.3s ease" },
  addressCardSelected: { borderColor: "#38a169", backgroundColor: "#f0fff4", boxShadow: "0 4px 12px rgba(56,161,105,0.15)" },
  addressCardContent: { display: "flex", gap: "12px", alignItems: "flex-start" },
  addressTypeIcon: { fontSize: "24px", minWidth: "40px", textAlign: "center" },
  addressTitle: { fontSize: "14px", fontWeight: "700", color: "#2d3748", margin: "0 0 4px" },
  addressDetail: { fontSize: "12px", color: "#718096", margin: "0 0 2px" },
  addressDetailFull: { fontSize: "12px", color: "#4a5568", margin: 0, lineHeight: "1.4" },
  addressCheck: { marginLeft: "auto", display: "flex", alignItems: "center" },
  checkMark: { fontSize: "20px", color: "#38a169", fontWeight: "700" },
  deleteAddressBtn: { background: "none", border: "none", fontSize: "16px", cursor: "pointer", opacity: 0.6, transition: "opacity 0.2s" },
  savedAddressesSection: { marginTop: "16px", paddingTop: "16px", borderTop: "2px solid #f0f4f8" },
  savedAddressesLabel: { fontSize: "12px", fontWeight: "700", color: "#a0aec0", letterSpacing: "0.5px", margin: "0 0 12px", textTransform: "uppercase" },
  addNewAddressBtn: { width: "100%", padding: "12px", backgroundColor: "transparent", border: "2px dashed #cbd5e0", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#38a169", transition: "all 0.2s" },
  addressForm: { marginTop: "16px", padding: "20px", backgroundColor: "#fafcff", borderRadius: "12px", border: "2px solid #e0f2fe" },
  formTitle: { fontSize: "14px", fontWeight: "700", color: "#2d3748", marginBottom: "14px" },
  typeSelector: { display: "flex", gap: "8px", marginBottom: "16px" },
  typeBtn: { flex: 1, padding: "10px", border: "2px solid #e2e8f0", borderRadius: "8px", backgroundColor: "white", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#718096", transition: "all 0.2s" },
  typeBtnActive: { borderColor: "#38a169", backgroundColor: "#f0fff4", color: "#38a169" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" },
  formField: { display: "flex", flexDirection: "column" },
  formLabel: { fontSize: "12px", fontWeight: "600", color: "#4a5568", marginBottom: "4px" },
  formInput: { padding: "10px 12px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  formTextarea: { padding: "10px 12px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "sans-serif", boxSizing: "border-box" },
  saveAddressBtn: { width: "100%", padding: "11px", backgroundColor: "#38a169", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "700", transition: "all 0.2s" },
  deliveryPreview: { backgroundColor: "#f0fff4", border: "2px solid #9ae6b4", borderRadius: "10px", padding: "14px", marginBottom: "16px" },
  previewRow: { display: "flex", gap: "8px", marginBottom: "8px", fontSize: "13px" },
  previewLabel: { fontWeight: "700", color: "#276749", minWidth: "90px" },
  previewValue: { flex: 1, color: "#2d3748", fontWeight: "600" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "6px" },
  textarea: { width: "100%", padding: "11px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "sans-serif", boxSizing: "border-box" },
  input: { width: "100%", padding: "11px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  voucherList: { display: "flex", flexDirection: "column", gap: "10px" },
  voucherOption: { display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px", border: "2px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", backgroundColor: "white", transition: "all 0.2s" },
  voucherOptionSelected: { borderColor: "#38a169", backgroundColor: "#f0fff4", boxShadow: "0 2px 8px rgba(56,161,105,0.15)" },
  voucherOptionDisabled: { opacity: 0.5, cursor: "not-allowed" },
  voucherOptionIcon: { fontSize: "24px", flexShrink: 0, marginTop: "2px" },
  voucherOptionName: { fontSize: "14px", fontWeight: "700", color: "#2d3748", margin: "0 0 2px" },
  voucherOptionDesc: { fontSize: "12px", color: "#718096", margin: 0 },
  voucherOptionWarn: { fontSize: "11px", color: "#e53e3e", fontWeight: "600", margin: "4px 0 0" },
  voucherRadio: { width: "22px", height: "22px", borderRadius: "50%", border: "2px solid #cbd5e0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "white", backgroundColor: "white" },
  voucherRadioSelected: { backgroundColor: "#38a169", borderColor: "#38a169" },
  paymentOption: { display: "flex", alignItems: "center", gap: "12px", padding: "14px", backgroundColor: "#f0fff4", borderRadius: "10px", border: "2px solid #9ae6b4", cursor: "pointer" },
  paymentLabel: { display: "flex", alignItems: "center", gap: "12px", flex: 1, cursor: "pointer" },
  summary: { width: "340px", flexShrink: 0, backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", position: "sticky", top: "20px" },
  summaryTitle: { fontSize: "18px", fontWeight: "800", color: "#2d3748", marginBottom: "18px" },
  orderList: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" },
  orderItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px", backgroundColor: "#f7fafc", borderRadius: "8px" },
  orderImg: { width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 },
  orderName: { fontSize: "13px", fontWeight: "600", color: "#2d3748", margin: "0 0 2px" },
  orderQty: { fontSize: "12px", color: "#718096", margin: 0 },
  orderPrice: { fontSize: "14px", fontWeight: "700", color: "#e53e3e", marginLeft: "auto" },
  divider: { borderTop: "2px solid #e2e8f0", margin: "14px 0" },
  pricingBox: { backgroundColor: "#f7fafc", borderRadius: "10px", padding: "12px", marginBottom: "16px" },
  pricingRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#4a5568", marginBottom: "8px" },
  pricingLabel: { fontWeight: "600" },
  pricingValue: { fontWeight: "700", color: "#2d3748" },
  freeShipHint: { backgroundColor: "#fffaf0", border: "1px solid #fed7d7", borderRadius: "6px", padding: "8px", marginTop: "8px" },
  totalSection: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" },
  totalLabel: { fontSize: "15px", fontWeight: "700", color: "#2d3748" },
  totalPrice: { fontSize: "24px", fontWeight: "800", color: "#e53e3e" },
  actionButtons: { display: "flex", flexDirection: "column", gap: "10px" },
  confirmBtn: { width: "100%", backgroundColor: "#38a169", color: "white", border: "none", padding: "14px", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 4px 12px rgba(56,161,105,0.3)" },
  backBtn: { width: "100%", backgroundColor: "transparent", color: "#38a169", border: "2px solid #38a169", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
  trustBadges: { display: "grid", gridTemplateColumns: "1fr", gap: "8px", marginTop: "16px" },
  trustBadge: { display: "flex", alignItems: "center", gap: "8px", padding: "8px", backgroundColor: "#f0fff4", borderRadius: "8px", fontSize: "12px", color: "#276749", fontWeight: "600" },
  successPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)", fontFamily: "sans-serif" },
  successBox: { textAlign: "center", backgroundColor: "white", borderRadius: "24px", padding: "48px 40px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", maxWidth: "460px", width: "90%" },
  successIcon: { fontSize: "72px", lineHeight: "1", marginBottom: "16px" },
  successTitle: { fontSize: "28px", fontWeight: "800", color: "#276749", margin: "0 0 20px" },
  orderIdBadge: { display: "inline-flex", flexDirection: "column", alignItems: "center", backgroundColor: "#f0fff4", border: "3px dashed #68d391", borderRadius: "14px", padding: "14px 28px", marginBottom: "24px" },
  orderIdLabel: { fontSize: "11px", color: "#38a169", fontWeight: "700", letterSpacing: "1px", marginBottom: "4px", textTransform: "uppercase" },
  orderIdValue: { fontSize: "20px", fontWeight: "800", color: "#2d3748", letterSpacing: "2px" },
  successText: { color: "#4a5568", fontSize: "15px", margin: "0 0 8px", lineHeight: "1.6" },
  deliveryInfo: { backgroundColor: "#f0fff4", border: "2px solid #9ae6b4", borderRadius: "12px", padding: "14px", margin: "20px 0", textAlign: "left" },
  deliveryItem: { display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "10px" },
  deliveryText: { fontSize: "13px", color: "#276749", fontWeight: "600", wordBreak: "break-word" },
  successBtns: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" },
  viewOrderBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "13px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  homeBtn: { backgroundColor: "transparent", color: "#38a169", border: "2px solid #38a169", padding: "11px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
};
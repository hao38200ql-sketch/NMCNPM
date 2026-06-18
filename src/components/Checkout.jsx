import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { useVoucher } from "../context/VoucherContext";

function Checkout() {
  const { user, updateProfile } = useAuth();
  const { vouchers, getUserVouchers, validateVoucher, applyVoucher, addPointsAndSpend } = useVoucher();
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherResult, setVoucherResult] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState("profile");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    id: null,
    type: "home", // home, office, other
    name: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false,
  });
  const [savedAddresses, setSavedAddresses] = useState(
    user?.savedAddresses || []
  );
  const [currentAddress, setCurrentAddress] = useState({
    name: user?.name || "",
    phone: user?.soDienThoai || "",
    address: user?.diaChi || "",
  });
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardForm, setCardForm] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [cardErrors, setCardErrors] = useState({});
  const [showQR, setShowQR] = useState(false);
  const { cartItems, clearCart } = useCart();
  const { addOrder } = useOrder();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total >= 200000 ? 0 : 30000;
  const grandTotal = total + shipping;

  // Voucher mà user đang sở hữu và chưa dùng
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
      // Bấm lại để bỏ chọn
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
      setCurrentAddress({
        name: user?.name || "",
        phone: user?.soDienThoai || "",
        address: user?.diaChi || "",
      });
    } else {
      const addr = savedAddresses.find((a) => a.id === addressId);
      if (addr) {
        setCurrentAddress({
          name: addr.name,
          phone: addr.phone,
          address: `${addr.address}, ${addr.ward}, ${addr.district}, ${addr.city}`,
        });
      }
    }
  };

  const handleSaveNewAddress = () => {
    if (!newAddress.name.trim() || !newAddress.phone.trim() || !newAddress.address.trim() || !newAddress.district.trim() || !newAddress.city.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const address = {
      id: Date.now().toString(),
      ...newAddress,
    };

    setSavedAddresses((prev) => [...prev, address]);
    updateProfile({
      ...user,
      savedAddresses: [...savedAddresses, address],
    });

    setCurrentAddress({
      name: address.name,
      phone: address.phone,
      address: `${address.address}, ${address.ward}, ${address.district}, ${address.city}`,
    });
    setSelectedAddressId(address.id);
    setShowAddressForm(false);
    setNewAddress({
      id: null,
      type: "home",
      name: "",
      phone: "",
      address: "",
      ward: "",
      district: "",
      city: "",
      isDefault: false,
    });
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      setSavedAddresses((prev) => prev.filter((a) => a.id !== addressId));
      updateProfile({
        ...user,
        savedAddresses: savedAddresses.filter((a) => a.id !== addressId),
      });
      if (selectedAddressId === addressId) {
        setSelectedAddressId("profile");
        handleSelectAddress("profile");
      }
    }
  };

  // Format card number with spaces
  const formatCardNumber = (val) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  // Format expiry MM/YY
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const validateCard = () => {
    const errs = {};
    const digits = cardForm.number.replace(/\s/g, "");
    if (digits.length < 16) errs.number = "Số thẻ phải có 16 chữ số";
    if (!cardForm.name.trim()) errs.name = "Vui lòng nhập tên chủ thẻ";
    const [mm, yy] = cardForm.expiry.split("/");
    const now = new Date();
    if (!mm || !yy || Number(mm) > 12 || Number(mm) < 1) errs.expiry = "Ngày hết hạn không hợp lệ";
    else if (Number("20" + yy) < now.getFullYear() || (Number("20" + yy) === now.getFullYear() && Number(mm) < now.getMonth() + 1))
      errs.expiry = "Thẻ đã hết hạn";
    if (cardForm.cvv.replace(/\D/g, "").length < 3) errs.cvv = "CVV không hợp lệ";
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = () => {
    if (!currentAddress.name.trim() || !currentAddress.phone.trim() || !currentAddress.address.trim()) {
      alert("Vui lòng chọn hoặc nhập địa chỉ giao hàng!");
      return;
    }
    if (paymentMethod === "card" && !validateCard()) return;
    if (paymentMethod === "qr") { setShowQR(true); return; }
    if (voucherResult?.valid) applyVoucher(voucherCode, user?.id);
    if (user) addPointsAndSpend(user.id, grandTotal - discount);
    const id = addOrder({
      cartItems,
      total,
      shipping,
      discount,
      paymentMethod,
      name: currentAddress.name,
      phone: currentAddress.phone,
      address: currentAddress.address,
      note,
      userId: user?.id,
      email: user?.email,
    });
    setOrderId(id);
    clearCart();
    setSuccess(true);
  };

  const handleQRConfirm = () => {
    if (voucherResult?.valid) applyVoucher(voucherCode, user?.id);
    if (user) addPointsAndSpend(user.id, grandTotal - discount);
    const id = addOrder({
      cartItems, total, shipping, discount, paymentMethod: "qr",
      name: currentAddress.name, phone: currentAddress.phone,
      address: currentAddress.address, note,
      userId: user?.id, email: user?.email,
    });
    setOrderId(id);
    clearCart();
    setShowQR(false);
    setSuccess(true);
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
          <div style={styles.deliveryInfo}>
            <div style={styles.deliveryItem}>
              <span style={{ fontSize: "24px" }}>📍</span>
              <span style={styles.deliveryText}>{currentAddress.address}</span>
            </div>
            <div style={styles.deliveryItem}>
              <span style={{ fontSize: "24px" }}>📞</span>
              <span style={styles.deliveryText}>{currentAddress.phone}</span>
            </div>
          </div>
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
          {/* Left - Address & Delivery */}
          <div style={styles.formBox}>
            {/* Address Selection */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>📍 Địa chỉ giao hàng</h3>
              </div>

              {/* Profile Address */}
              <div
                style={{
                  ...styles.addressCard,
                  ...(selectedAddressId === "profile" ? styles.addressCardSelected : {}),
                }}
                onClick={() => handleSelectAddress("profile")}
              >
                <div style={styles.addressCardContent}>
                  <div style={styles.addressTypeIcon}>👤</div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.addressTitle}>Địa chỉ từ hồ sơ</p>
                    <p style={styles.addressDetail}>{user?.name}</p>
                    <p style={styles.addressDetail}>{user?.soDienThoai}</p>
                    <p style={styles.addressDetailFull}>{user?.diaChi || "Chưa cập nhật"}</p>
                  </div>
                  <div style={styles.addressCheck}>
                    {selectedAddressId === "profile" && <span style={styles.checkMark}>✓</span>}
                  </div>
                </div>
              </div>

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div style={styles.savedAddressesSection}>
                  <p style={styles.savedAddressesLabel}>Địa chỉ đã lưu</p>
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        ...styles.addressCard,
                        ...(selectedAddressId === addr.id ? styles.addressCardSelected : {}),
                      }}
                      onClick={() => handleSelectAddress(addr.id)}
                    >
                      <div style={styles.addressCardContent}>
                        <div style={{ ...styles.addressTypeIcon, fontSize: "16px" }}>
                          {addr.type === "home" ? "🏠" : addr.type === "office" ? "🏢" : "📍"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={styles.addressTitle}>{addr.name}</p>
                          <p style={styles.addressDetail}>{addr.phone}</p>
                          <p style={styles.addressDetailFull}>
                            {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                          </p>
                        </div>
                        <button
                          style={styles.deleteAddressBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(addr.id);
                          }}
                        >
                          🗑️
                        </button>
                        <div style={styles.addressCheck}>
                          {selectedAddressId === addr.id && <span style={styles.checkMark}>✓</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Button */}
              <button
                style={styles.addNewAddressBtn}
                onClick={() => setShowAddressForm(!showAddressForm)}
              >
                {showAddressForm ? "✕ Hủy" : "+ Thêm địa chỉ mới"}
              </button>

              {/* Add Address Form */}
              {showAddressForm && (
                <div style={styles.addressForm}>
                  <h4 style={styles.formTitle}>Thêm địa chỉ mới</h4>

                  {/* Address Type */}
                  <div style={styles.typeSelector}>
                    {[
                      { value: "home", label: "🏠 Nhà", icon: "🏠" },
                      { value: "office", label: "🏢 Văn phòng", icon: "🏢" },
                      { value: "other", label: "📍 Khác", icon: "📍" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        style={{
                          ...styles.typeBtn,
                          ...(newAddress.type === type.value ? styles.typeBtnActive : {}),
                        }}
                        onClick={() => setNewAddress((prev) => ({ ...prev, type: type.value }))}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Form Fields */}
                  <div style={styles.formGrid}>
                    <div style={{ ...styles.formField, gridColumn: "1 / -1" }}>
                      <label style={styles.formLabel}>Tên địa chỉ *</label>
                      <input
                        style={styles.formInput}
                        placeholder="VD: Nhà riêng, Văn phòng..."
                        value={newAddress.name}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Số điện thoại *</label>
                      <input
                        style={styles.formInput}
                        placeholder="0901234567"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Tỉnh/Thành phố *</label>
                      <input
                        style={styles.formInput}
                        placeholder="Hà Nội"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                      />
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Quận/Huyện *</label>
                      <input
                        style={styles.formInput}
                        placeholder="Ba Đình"
                        value={newAddress.district}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, district: e.target.value }))}
                      />
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Phường/Xã</label>
                      <input
                        style={styles.formInput}
                        placeholder="Cát Linh"
                        value={newAddress.ward}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, ward: e.target.value }))}
                      />
                    </div>

                    <div style={{ ...styles.formField, gridColumn: "1 / -1" }}>
                      <label style={styles.formLabel}>Số nhà, tên đường *</label>
                      <textarea
                        style={styles.formTextarea}
                        placeholder="Số 123 Đường Tây Sơn"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, address: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  </div>

                  <button style={styles.saveAddressBtn} onClick={handleSaveNewAddress}>
                    💾 Lưu địa chỉ
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🚚 Thông tin giao hàng</h3>

              <div style={styles.deliveryPreview}>
                <div style={styles.previewRow}>
                  <span style={styles.previewLabel}>Người nhận:</span>
                  <span style={styles.previewValue}>{currentAddress.name || "—"}</span>
                </div>
                <div style={styles.previewRow}>
                  <span style={styles.previewLabel}>Số điện thoại:</span>
                  <span style={styles.previewValue}>{currentAddress.phone || "—"}</span>
                </div>
                <div style={styles.previewRow}>
                  <span style={styles.previewLabel}>Địa chỉ:</span>
                  <span style={styles.previewValue}>{currentAddress.address || "—"}</span>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Ghi chú đơn hàng</label>
                <textarea
                  placeholder="Ghi chú giao hàng (VD: giao lúc nào, để ở đâu...)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={styles.textarea}
                  rows={3}
                />
              </div>

              {myVouchers.length > 0 && (
                <div style={styles.field}>
                  <label style={styles.label}>🎁 Voucher của bạn ({myVouchers.length})</label>
                  <div style={styles.voucherList}>
                    {myVouchers.map((voucher) => {
                      const eligible = total >= voucher.minOrder;
                      const isSelected = selectedVoucherId === voucher.id;
                      return (
                        <div
                          key={voucher.id}
                          onClick={() => eligible && handleSelectVoucher(voucher)}
                          style={{
                            ...styles.voucherOption,
                            ...(isSelected ? styles.voucherOptionSelected : {}),
                            ...(eligible ? {} : styles.voucherOptionDisabled),
                          }}
                        >
                          <span style={styles.voucherOptionIcon}>{voucher.icon}</span>
                          <div style={{ flex: 1 }}>
                            <p style={styles.voucherOptionName}>{voucher.name}</p>
                            <p style={styles.voucherOptionDesc}>{voucher.description}</p>
                            {!eligible && (
                              <p style={styles.voucherOptionWarn}>
                                Cần đơn từ {voucher.minOrder.toLocaleString("vi-VN")}đ
                              </p>
                            )}
                          </div>
                          <div style={{
                            ...styles.voucherRadio,
                            ...(isSelected ? styles.voucherRadioSelected : {}),
                          }}>
                            {isSelected && "✓"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>🎫 Nhập mã voucher khác</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Nhập mã voucher..."
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value.toUpperCase());
                      setSelectedVoucherId(null);
                    }}
                    style={{ ...styles.input, letterSpacing: "1px", fontWeight: "600" }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    style={{ backgroundColor: "#f6ad55", color: "white", border: "none", padding: "0 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", whiteSpace: "nowrap" }}
                  >
                    Áp dụng
                  </button>
                </div>
                {voucherResult && (
                  <div style={{
                    marginTop: "8px", padding: "10px 14px", borderRadius: "8px",
                    backgroundColor: voucherResult.valid ? "#f0fff4" : "#fff5f5",
                    color: voucherResult.valid ? "#276749" : "#c53030",
                    fontSize: "13px", fontWeight: "600",
                    border: `1px solid ${voucherResult.valid ? "#68d391" : "#fc8181"}`,
                  }}>
                    {voucherResult.valid ? "✅" : "❌"} {voucherResult.message}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💳 Phương thức thanh toán</h3>
              <div style={styles.paymentOptions}>

                {/* COD */}
                {[
                  { id: "cod", icon: "💵", label: "Thanh toán khi nhận hàng (COD)", sub: "An toàn, không phí phát sinh" },
                  { id: "card", icon: "💳", label: "Thẻ tín dụng / Ghi nợ", sub: "Visa, Mastercard, JCB" },
                  { id: "qr", icon: "📱", label: "Chuyển khoản QR Code", sub: "Momo, ZaloPay, Internet Banking" },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    style={{
                      ...styles.paymentOption,
                      ...(paymentMethod === opt.id ? styles.paymentOptionActive : {}),
                    }}
                    onClick={() => setPaymentMethod(opt.id)}
                  >
                    <div style={{
                      ...styles.paymentRadio,
                      ...(paymentMethod === opt.id ? styles.paymentRadioActive : {}),
                    }}>
                      {paymentMethod === opt.id && <div style={styles.paymentRadioDot} />}
                    </div>
                    <span style={{ fontSize: "22px" }}>{opt.icon}</span>
                    <div>
                      <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "14px", color: "#1f2937" }}>{opt.label}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{opt.sub}</p>
                    </div>
                  </div>
                ))}

                {/* Credit card form */}
                {paymentMethod === "card" && (
                  <div style={styles.cardForm}>
                    <div style={styles.cardPreview}>
                      <div style={styles.cardChip}>💳</div>
                      <p style={styles.cardPreviewNumber}>
                        {cardForm.number || "•••• •••• •••• ••••"}
                      </p>
                      <div style={styles.cardPreviewBottom}>
                        <span style={styles.cardPreviewName}>{cardForm.name || "TÊN CHỦ THẺ"}</span>
                        <span style={styles.cardPreviewExpiry}>{cardForm.expiry || "MM/YY"}</span>
                      </div>
                    </div>

                    <div style={styles.cardFields}>
                      <div style={styles.cardField}>
                        <label style={styles.cardLabel}>Số thẻ *</label>
                        <input
                          style={{ ...styles.cardInput, ...(cardErrors.number ? styles.cardInputError : {}) }}
                          placeholder="1234 5678 9012 3456"
                          value={cardForm.number}
                          maxLength={19}
                          onChange={(e) => setCardForm((f) => ({ ...f, number: formatCardNumber(e.target.value) }))}
                        />
                        {cardErrors.number && <span style={styles.cardError}>{cardErrors.number}</span>}
                      </div>
                      <div style={styles.cardField}>
                        <label style={styles.cardLabel}>Tên chủ thẻ *</label>
                        <input
                          style={{ ...styles.cardInput, ...(cardErrors.name ? styles.cardInputError : {}) }}
                          placeholder="NGUYEN VAN A"
                          value={cardForm.name}
                          onChange={(e) => setCardForm((f) => ({ ...f, name: e.target.value.toUpperCase() }))}
                        />
                        {cardErrors.name && <span style={styles.cardError}>{cardErrors.name}</span>}
                      </div>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <div style={{ ...styles.cardField, flex: 1 }}>
                          <label style={styles.cardLabel}>Hết hạn *</label>
                          <input
                            style={{ ...styles.cardInput, ...(cardErrors.expiry ? styles.cardInputError : {}) }}
                            placeholder="MM/YY"
                            value={cardForm.expiry}
                            maxLength={5}
                            onChange={(e) => setCardForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                          />
                          {cardErrors.expiry && <span style={styles.cardError}>{cardErrors.expiry}</span>}
                        </div>
                        <div style={{ ...styles.cardField, flex: 1 }}>
                          <label style={styles.cardLabel}>CVV *</label>
                          <input
                            style={{ ...styles.cardInput, ...(cardErrors.cvv ? styles.cardInputError : {}) }}
                            placeholder="•••"
                            type="password"
                            maxLength={4}
                            value={cardForm.cvv}
                            onChange={(e) => setCardForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                          />
                          {cardErrors.cvv && <span style={styles.cardError}>{cardErrors.cvv}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={styles.cardLogos}>
                      {["VISA", "MC", "JCB", "AMEX"].map((b) => (
                        <span key={b} style={styles.cardLogo}>{b}</span>
                      ))}
                      <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "auto" }}>🔒 Mã hóa SSL 256-bit</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div style={styles.summary}>
            <h3 style={styles.summaryTitle}>🧾 Tóm tắt đơn hàng</h3>

            {/* Items */}
            <div style={styles.orderList}>
              {cartItems.map((item) => (
                <div key={item.id} style={styles.orderItem}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={styles.orderImg}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/50";
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={styles.orderName}>{item.title}</p>
                    <p style={styles.orderQty}>x{item.quantity}</p>
                  </div>
                  <span style={styles.orderPrice}>{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
                </div>
              ))}
            </div>

            <div style={styles.divider} />

            {/* Pricing */}
            <div style={styles.pricingBox}>
              <div style={styles.pricingRow}>
                <span style={styles.pricingLabel}>Tạm tính:</span>
                <span style={styles.pricingValue}>{total.toLocaleString("vi-VN")}đ</span>
              </div>
              <div style={styles.pricingRow}>
                <span style={styles.pricingLabel}>Phí giao hàng:</span>
                <span style={{ ...styles.pricingValue, color: "#38a169", fontWeight: "700" }}>
                  {shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString("vi-VN")}đ`}
                </span>
              </div>

              {total < 200000 && shipping > 0 && (
                <div style={styles.freeShipHint}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#f6ad55", fontWeight: "700" }}>
                    🎁 Mua thêm {(200000 - total).toLocaleString("vi-VN")}đ để được miễn phí giao hàng!
                  </p>
                </div>
              )}

              {discount > 0 && (
                <div style={styles.pricingRow}>
                  <span style={{ color: "#38a169" }}>Giảm voucher:</span>
                  <span style={{ color: "#38a169", fontWeight: "700" }}>-{discount.toLocaleString("vi-VN")}đ</span>
                </div>
              )}

              <div style={styles.divider} />

              <div style={styles.totalSection}>
                <span style={styles.totalLabel}>Tổng cộng:</span>
                <span style={styles.totalPrice}>{(grandTotal - discount).toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button style={styles.confirmBtn} onClick={handleConfirm}>
                ✅ Xác nhận đặt hàng
              </button>
              <button style={styles.backBtn} onClick={() => navigate("/cart")}>
                ← Quay lại giỏ hàng
              </button>
            </div>

            {/* Trust Badges */}
            <div style={styles.trustBadges}>
              <div style={styles.trustBadge}>
                <span>✅</span>
                <span>Thanh toán an toàn</span>
              </div>
              <div style={styles.trustBadge}>
                <span>🚚</span>
                <span>Giao hàng nhanh</span>
              </div>
              <div style={styles.trustBadge}>
                <span>🔄</span>
                <span>Đổi trả dễ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== QR MODAL ===== */}
      {showQR && (
        <div style={styles.qrOverlay}>
          <div style={styles.qrModal}>
            <button style={styles.qrClose} onClick={() => setShowQR(false)}>✕</button>
            <h3 style={styles.qrTitle}>📱 Quét mã để thanh toán</h3>
            <p style={styles.qrAmount}>
              Số tiền: <strong style={{ color: "#16a34a", fontSize: "22px" }}>
                {(grandTotal - discount).toLocaleString("vi-VN")}đ
              </strong>
            </p>

            <div style={styles.qrTabs}>
              {[
                { id: "vietqr", label: "VietQR / Banking", icon: "🏦" },
                { id: "momo", label: "Momo", icon: "🟣" },
                { id: "zalopay", label: "ZaloPay", icon: "🔵" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  style={{
                    ...styles.qrTab,
                    ...(styles.qrTab),
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* VietQR generated via vietqr.io public API (no key required) */}
            <div style={styles.qrImageBox}>
              <img
                src={`https://img.vietqr.io/image/970422-1234567890-compact2.png?amount=${grandTotal - discount}&addInfo=${encodeURIComponent("FreshMart Order " + Date.now())}&accountName=FRESHMART`}
                alt="QR thanh toán"
                style={styles.qrImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(`Chuyen khoan: ${grandTotal - discount}d - FreshMart Order`);
                }}
              />
            </div>

            <div style={styles.qrInfo}>
              <div style={styles.qrInfoRow}>
                <span style={styles.qrInfoLabel}>Ngân hàng</span>
                <span style={styles.qrInfoVal}>MB Bank (970422)</span>
              </div>
              <div style={styles.qrInfoRow}>
                <span style={styles.qrInfoLabel}>Số tài khoản</span>
                <span style={styles.qrInfoVal}>1234567890</span>
              </div>
              <div style={styles.qrInfoRow}>
                <span style={styles.qrInfoLabel}>Chủ tài khoản</span>
                <span style={styles.qrInfoVal}>CONG TY FRESHMART</span>
              </div>
              <div style={styles.qrInfoRow}>
                <span style={styles.qrInfoLabel}>Số tiền</span>
                <span style={{ ...styles.qrInfoVal, color: "#16a34a", fontWeight: "800" }}>
                  {(grandTotal - discount).toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div style={styles.qrInfoRow}>
                <span style={styles.qrInfoLabel}>Nội dung CK</span>
                <span style={styles.qrInfoVal}>FRESHMART {currentAddress.phone}</span>
              </div>
            </div>

            <p style={styles.qrNote}>
              💡 Sau khi chuyển khoản thành công, bấm xác nhận để hoàn tất đơn hàng.
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button style={styles.qrCancelBtn} onClick={() => setShowQR(false)}>
                Huỷ
              </button>
              <button style={styles.qrConfirmBtn} onClick={handleQRConfirm}>
                ✅ Đã thanh toán xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: "40px" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" },
  pageTitle: { fontSize: "28px", fontWeight: "800", color: "#2d3748", marginBottom: "32px" },
  layout: { display: "flex", gap: "28px", alignItems: "flex-start", flexWrap: "wrap" },

  /* Form Box */
  formBox: { flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "24px" },

  section: { backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#2d3748", margin: 0 },

  /* Address Cards */
  addressCard: {
    padding: "16px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "white",
    cursor: "pointer",
    marginBottom: "12px",
    transition: "all 0.3s ease",
  },
  addressCardSelected: {
    borderColor: "#38a169",
    backgroundColor: "#f0fff4",
    boxShadow: "0 4px 12px rgba(56,161,105,0.15)",
  },
  addressCardContent: { display: "flex", gap: "12px", alignItems: "flex-start" },
  addressTypeIcon: { fontSize: "24px", minWidth: "40px", textAlign: "center" },
  addressTitle: { fontSize: "14px", fontWeight: "700", color: "#2d3748", margin: "0 0 4px" },
  addressDetail: { fontSize: "12px", color: "#718096", margin: "0 0 2px" },
  addressDetailFull: { fontSize: "12px", color: "#4a5568", margin: 0, lineHeight: "1.4" },
  addressCheck: { marginLeft: "auto", display: "flex", alignItems: "center" },
  checkMark: { fontSize: "20px", color: "#38a169", fontWeight: "700" },
  deleteAddressBtn: { background: "none", border: "none", fontSize: "16px", cursor: "pointer", opacity: 0.6, transition: "opacity 0.2s" },

  /* Saved Addresses */
  savedAddressesSection: { marginTop: "16px", paddingTop: "16px", borderTop: "2px solid #f0f4f8" },
  savedAddressesLabel: { fontSize: "12px", fontWeight: "700", color: "#a0aec0", letterSpacing: "0.5px", margin: "0 0 12px", textTransform: "uppercase" },

  /* Add New Address */
  addNewAddressBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "transparent",
    border: "2px dashed #cbd5e0",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#38a169",
    transition: "all 0.2s",
  },

  /* Address Form */
  addressForm: {
    marginTop: "16px",
    padding: "20px",
    backgroundColor: "#fafcff",
    borderRadius: "12px",
    border: "2px solid #e0f2fe",
  },
  formTitle: { fontSize: "14px", fontWeight: "700", color: "#2d3748", marginBottom: "14px" },

  typeSelector: { display: "flex", gap: "8px", marginBottom: "16px" },
  typeBtn: {
    flex: 1,
    padding: "10px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    color: "#718096",
    transition: "all 0.2s",
  },
  typeBtnActive: { borderColor: "#38a169", backgroundColor: "#f0fff4", color: "#38a169" },

  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" },
  formField: { display: "flex", flexDirection: "column" },
  formLabel: { fontSize: "12px", fontWeight: "600", color: "#4a5568", marginBottom: "4px" },
  formInput: { padding: "10px 12px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  formTextarea: { padding: "10px 12px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "sans-serif", boxSizing: "border-box" },

  saveAddressBtn: {
    width: "100%",
    padding: "11px",
    backgroundColor: "#38a169",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    transition: "all 0.2s",
  },

  /* Delivery Preview */
  deliveryPreview: {
    backgroundColor: "#f0fff4",
    border: "2px solid #9ae6b4",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "16px",
  },
  previewRow: { display: "flex", gap: "8px", marginBottom: "8px", fontSize: "13px" },
  previewLabel: { fontWeight: "700", color: "#276749", minWidth: "90px" },
  previewValue: { flex: 1, color: "#2d3748", fontWeight: "600" },

  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#4a5568", marginBottom: "6px" },
  textarea: { width: "100%", padding: "11px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "sans-serif", boxSizing: "border-box" },
  input: { width: "100%", padding: "11px 14px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" },

  /* Voucher selection */
  voucherList: { display: "flex", flexDirection: "column", gap: "10px" },
  voucherOption: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px 14px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    cursor: "pointer",
    backgroundColor: "white",
    transition: "all 0.2s",
  },
  voucherOptionSelected: {
    borderColor: "#38a169",
    backgroundColor: "#f0fff4",
    boxShadow: "0 2px 8px rgba(56,161,105,0.15)",
  },
  voucherOptionDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  voucherOptionIcon: { fontSize: "24px", flexShrink: 0, marginTop: "2px" },
  voucherOptionName: { fontSize: "14px", fontWeight: "700", color: "#2d3748", margin: "0 0 2px" },
  voucherOptionDesc: { fontSize: "12px", color: "#718096", margin: 0 },
  voucherOptionWarn: { fontSize: "11px", color: "#e53e3e", fontWeight: "600", margin: "4px 0 0" },
  voucherRadio: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    border: "2px solid #cbd5e0",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
    color: "white",
    backgroundColor: "white",
  },
  voucherRadioSelected: {
    backgroundColor: "#38a169",
    borderColor: "#38a169",
  },

  /* Payment */
  paymentOptions: { display: "flex", flexDirection: "column", gap: "10px" },
  paymentOption: {
    display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
    backgroundColor: "white", borderRadius: "12px", border: "2px solid #e2e8f0",
    cursor: "pointer", transition: "all 0.2s",
  },
  paymentOptionActive: {
    borderColor: "#16a34a", backgroundColor: "#f0fff4",
    boxShadow: "0 2px 8px rgba(22,163,74,0.15)",
  },
  paymentRadio: {
    width: "20px", height: "20px", borderRadius: "50%",
    border: "2px solid #cbd5e0", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  paymentRadioActive: { borderColor: "#16a34a" },
  paymentRadioDot: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#16a34a" },
  paymentLabel: { display: "flex", alignItems: "center", gap: "12px", flex: 1, cursor: "pointer" },

  /* Credit card form */
  cardForm: {
    backgroundColor: "#f8fafc", borderRadius: "12px",
    padding: "18px", display: "flex", flexDirection: "column", gap: "14px",
    border: "1px solid #e2e8f0",
  },
  cardPreview: {
    background: "linear-gradient(135deg, #1f2937, #374151)",
    borderRadius: "14px", padding: "20px 24px", color: "white",
    height: "120px", display: "flex", flexDirection: "column", justifyContent: "space-between",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  cardChip: { fontSize: "24px" },
  cardPreviewNumber: { fontSize: "16px", fontFamily: "monospace", letterSpacing: "3px", margin: 0 },
  cardPreviewBottom: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
  cardPreviewName: { fontSize: "12px", fontWeight: "700", letterSpacing: "1px" },
  cardPreviewExpiry: { fontSize: "12px", opacity: 0.8 },
  cardFields: { display: "flex", flexDirection: "column", gap: "10px" },
  cardField: { display: "flex", flexDirection: "column", gap: "4px" },
  cardLabel: { fontSize: "12px", fontWeight: "700", color: "#4b5563" },
  cardInput: {
    padding: "10px 12px", border: "2px solid #e2e8f0", borderRadius: "8px",
    fontSize: "14px", outline: "none", boxSizing: "border-box", width: "100%",
    backgroundColor: "white",
  },
  cardInputError: { borderColor: "#ef4444", backgroundColor: "#fff5f5" },
  cardError: { fontSize: "11px", color: "#ef4444", fontWeight: "600" },
  cardLogos: {
    display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
  },
  cardLogo: {
    backgroundColor: "white", border: "1px solid #e2e8f0",
    borderRadius: "6px", padding: "4px 10px",
    fontSize: "11px", fontWeight: "800", color: "#374151",
  },

  /* QR Modal */
  qrOverlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
  },
  qrModal: {
    backgroundColor: "white", borderRadius: "20px", padding: "32px 28px",
    width: "100%", maxWidth: "420px", maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 24px 64px rgba(0,0,0,0.25)", position: "relative",
  },
  qrClose: {
    position: "absolute", top: "16px", right: "16px",
    background: "#f3f4f6", border: "none", borderRadius: "50%",
    width: "32px", height: "32px", cursor: "pointer",
    fontSize: "14px", fontWeight: "700", color: "#374151",
  },
  qrTitle: { fontSize: "20px", fontWeight: "800", color: "#1f2937", margin: "0 0 8px" },
  qrAmount: { fontSize: "14px", color: "#6b7280", margin: "0 0 20px" },
  qrTabs: { display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" },
  qrTab: {
    padding: "7px 14px", borderRadius: "999px", border: "1px solid #e2e8f0",
    fontSize: "12px", fontWeight: "600", cursor: "pointer", backgroundColor: "#16a34a", color: "white",
  },
  qrImageBox: {
    display: "flex", justifyContent: "center", marginBottom: "18px",
    backgroundColor: "#f9fafb", borderRadius: "12px", padding: "16px",
    border: "1px solid #e2e8f0",
  },
  qrImage: { width: "200px", height: "200px", borderRadius: "8px" },
  qrInfo: {
    backgroundColor: "#f0fdf4", borderRadius: "10px", padding: "14px 16px",
    display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px",
    border: "1px solid #bbf7d0",
  },
  qrInfoRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  qrInfoLabel: { fontSize: "12px", color: "#6b7280", fontWeight: "600" },
  qrInfoVal: { fontSize: "13px", color: "#1f2937", fontWeight: "700", fontFamily: "monospace" },
  qrNote: { fontSize: "12px", color: "#9a3412", backgroundColor: "#fff7ed", borderRadius: "8px", padding: "10px 14px", margin: "0 0 16px", border: "1px solid #fed7aa" },
  qrCancelBtn: {
    flex: 1, padding: "12px", borderRadius: "10px", border: "2px solid #e2e8f0",
    backgroundColor: "white", color: "#374151", cursor: "pointer", fontSize: "14px", fontWeight: "700",
  },
  qrConfirmBtn: {
    flex: 2, padding: "12px", borderRadius: "10px", border: "none",
    backgroundColor: "#16a34a", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "800",
    boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
  },

  /* Summary */
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

  freeShipHint: {
    backgroundColor: "#fffaf0",
    border: "1px solid #fed7d7",
    borderRadius: "6px",
    padding: "8px",
    marginTop: "8px",
  },

  totalSection: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" },
  totalLabel: { fontSize: "15px", fontWeight: "700", color: "#2d3748" },
  totalPrice: { fontSize: "24px", fontWeight: "800", color: "#e53e3e" },

  actionButtons: { display: "flex", flexDirection: "column", gap: "10px" },
  confirmBtn: {
    width: "100%",
    backgroundColor: "#38a169",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 12px rgba(56,161,105,0.3)",
  },
  backBtn: {
    width: "100%",
    backgroundColor: "transparent",
    color: "#38a169",
    border: "2px solid #38a169",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  trustBadges: { display: "grid", gridTemplateColumns: "1fr", gap: "8px", marginTop: "16px" },
  trustBadge: { display: "flex", alignItems: "center", gap: "8px", padding: "8px", backgroundColor: "#f0fff4", borderRadius: "8px", fontSize: "12px", color: "#276749", fontWeight: "600" },

  /* Success */
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

export default Checkout;
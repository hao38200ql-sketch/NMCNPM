import { createContext, useContext, useState, useCallback, useMemo } from "react";

const VoucherContext = createContext();

// Danh sách voucher mặc định
const initialVouchers = [
  {
    id: "V001",
    code: "WELCOME50",
    name: "Chào mừng thành viên mới",
    description: "Giảm 50.000đ cho đơn hàng đầu tiên",
    type: "fixed", // fixed | percent
    value: 50000,
    minOrder: 150000,
    maxDiscount: 50000,
    quantity: 1000,
    used: 0,
    startDate: "2024-01-01",
    endDate: "2026-12-31",
    active: true,
    forNewUser: true,
    category: "welcome",
    icon: "🎉",
  },
  {
    id: "V002",
    code: "FREESHIP",
    name: "Miễn phí giao hàng",
    description: "Miễn phí giao hàng cho mọi đơn hàng",
    type: "shipping",
    value: 30000,
    minOrder: 100000,
    maxDiscount: 30000,
    quantity: 500,
    used: 0,
    startDate: "2024-01-01",
    endDate: "2026-12-31",
    active: true,
    forNewUser: false,
    category: "shipping",
    icon: "🚚",
  },
  {
    id: "V003",
    code: "SAVE10",
    name: "Giảm 10% đơn hàng",
    description: "Giảm 10% tối đa 100.000đ",
    type: "percent",
    value: 10,
    minOrder: 200000,
    maxDiscount: 100000,
    quantity: 300,
    used: 0,
    startDate: "2024-01-01",
    endDate: "2026-12-31",
    active: true,
    forNewUser: false,
    category: "sale",
    icon: "💸",
  },
  {
    id: "V004",
    code: "VIP20",
    name: "Ưu đãi VIP 20%",
    description: "Giảm 20% tối đa 200.000đ cho khách VIP",
    type: "percent",
    value: 20,
    minOrder: 500000,
    maxDiscount: 200000,
    quantity: 100,
    used: 0,
    startDate: "2024-01-01",
    endDate: "2026-12-31",
    active: true,
    forNewUser: false,
    category: "vip",
    icon: "👑",
  },
  {
    id: "V005",
    code: "SUMMER30",
    name: "Khuyến mãi hè 30%",
    description: "Giảm 30% tối đa 150.000đ mùa hè",
    type: "percent",
    value: 30,
    minOrder: 300000,
    maxDiscount: 150000,
    quantity: 200,
    used: 0,
    startDate: "2024-06-01",
    endDate: "2026-08-31",
    active: true,
    forNewUser: false,
    category: "seasonal",
    icon: "☀️",
  },
  {
    id: "V006",
    code: "LOYAL100",
    name: "Khách hàng thân thiết",
    description: "Giảm 100.000đ cho đơn từ 400.000đ",
    type: "fixed",
    value: 100000,
    minOrder: 400000,
    maxDiscount: 100000,
    quantity: 150,
    used: 0,
    startDate: "2024-01-01",
    endDate: "2026-12-31",
    active: true,
    forNewUser: false,
    category: "loyal",
    icon: "💎",
  },
];

// Chương trình tri ân
const initialLoyaltyPrograms = [
  {
    id: "LP001",
    name: "Thành viên Bạc",
    icon: "🥈",
    color: "#a0aec0",
    bgColor: "#f7fafc",
    minSpend: 0,
    maxSpend: 999999,
    benefits: [
      "Tích điểm 1% mỗi đơn hàng",
      "Voucher WELCOME50 khi đăng ký",
      "Ưu đãi sinh nhật",
    ],
    voucherIds: ["V001", "V002"],
    pointRate: 1,
  },
  {
    id: "LP002",
    name: "Thành viên Vàng",
    icon: "🥇",
    color: "#d69e2e",
    bgColor: "#fffff0",
    minSpend: 1000000,
    maxSpend: 4999999,
    benefits: [
      "Tích điểm 2% mỗi đơn hàng",
      "Miễn phí giao hàng mọi đơn",
      "Voucher giảm 10% hàng tháng",
      "Ưu tiên hỗ trợ khách hàng",
    ],
    voucherIds: ["V002", "V003"],
    pointRate: 2,
  },
  {
    id: "LP003",
    name: "Thành viên Bạch Kim",
    icon: "💎",
    color: "#3182ce",
    bgColor: "#ebf8ff",
    minSpend: 5000000,
    maxSpend: 9999999,
    benefits: [
      "Tích điểm 3% mỗi đơn hàng",
      "Miễn phí giao hàng mọi đơn",
      "Voucher giảm 20% hàng tháng",
      "Quà tặng sinh nhật đặc biệt",
      "Hỗ trợ 24/7",
    ],
    voucherIds: ["V002", "V004"],
    pointRate: 3,
  },
  {
    id: "LP004",
    name: "Thành viên VIP",
    icon: "👑",
    color: "#e53e3e",
    bgColor: "#fff5f5",
    minSpend: 10000000,
    maxSpend: Infinity,
    benefits: [
      "Tích điểm 5% mỗi đơn hàng",
      "Miễn phí giao hàng + ưu tiên",
      "Voucher giảm 30% không giới hạn",
      "Quà VIP hàng quý",
      "Hotline riêng 24/7",
      "Trải nghiệm sản phẩm mới trước",
    ],
    voucherIds: ["V002", "V004", "V005", "V006"],
    pointRate: 5,
  },
];

export function VoucherProvider({ children }) {
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [loyaltyPrograms] = useState(initialLoyaltyPrograms);
  const [userVouchers, setUserVouchers] = useState({});
  const [userPoints, setUserPoints] = useState({});
  const [userSpend, setUserSpend] = useState({});

  // Lấy cấp độ thành viên của user
  const getUserLevel = useCallback((userId) => {
    const spend = userSpend[userId] || 0;
    return loyaltyPrograms.find(
      (lp) => spend >= lp.minSpend && spend <= lp.maxSpend
    ) || loyaltyPrograms[0];
  }, [userSpend, loyaltyPrograms]);

  // Lấy voucher của user
  const getUserVouchers = useCallback((userId) => {
    return userVouchers[userId] || [];
  }, [userVouchers]);

  // Kiểm tra voucher có hợp lệ
  const validateVoucher = useCallback((code, orderTotal, userId) => {
    const voucher = vouchers.find(
      (v) => v.code === code && v.active
    );
    if (!voucher) return { valid: false, message: "Mã voucher không tồn tại!" };

    const now = new Date();
    const start = new Date(voucher.startDate);
    const end = new Date(voucher.endDate);
    if (now < start || now > end) return { valid: false, message: "Voucher đã hết hạn!" };
    if (voucher.used >= voucher.quantity) return { valid: false, message: "Voucher đã hết lượt sử dụng!" };
    if (orderTotal < voucher.minOrder) return {
      valid: false,
      message: `Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString("vi-VN")}đ!`,
    };

    const uvList = userVouchers[userId] || [];
    const alreadyUsed = uvList.find((uv) => uv.voucherId === voucher.id && uv.used);
    if (alreadyUsed) return { valid: false, message: "Bạn đã dùng voucher này rồi!" };

    let discount = 0;
    if (voucher.type === "fixed") discount = voucher.value;
    else if (voucher.type === "percent") discount = Math.min(orderTotal * voucher.value / 100, voucher.maxDiscount);
    else if (voucher.type === "shipping") discount = voucher.value;

    return { valid: true, voucher, discount, message: `Áp dụng thành công! Giảm ${discount.toLocaleString("vi-VN")}đ` };
  }, [vouchers, userVouchers]);

  // Dùng voucher
  const applyVoucher = useCallback((code, userId) => {
    const voucher = vouchers.find((v) => v.code === code);
    if (!voucher) return;
    setVouchers((prev) =>
      prev.map((v) => v.id === voucher.id ? { ...v, used: v.used + 1 } : v)
    );
    setUserVouchers((prev) => ({
      ...prev,
      [userId]: [
        ...(prev[userId] || []),
        { voucherId: voucher.id, code, used: true, usedAt: new Date().toISOString() },
      ],
    }));
  }, [vouchers]);

  // Tặng voucher cho user
  const grantVoucher = useCallback((userId, voucherId) => {
    const uvList = userVouchers[userId] || [];
    const exists = uvList.find((uv) => uv.voucherId === voucherId && !uv.used);
    if (exists) return;
    setUserVouchers((prev) => ({
      ...prev,
      [userId]: [
        ...(prev[userId] || []),
        { voucherId, used: false, grantedAt: new Date().toISOString() },
      ],
    }));
  }, [userVouchers]);

  // Cộng điểm và chi tiêu sau khi mua hàng
  const addPointsAndSpend = useCallback((userId, orderTotal) => {
    const level = getUserLevel(userId);
    const points = Math.floor(orderTotal * level.pointRate / 100);
    setUserPoints((prev) => ({
      ...prev,
      [userId]: (prev[userId] || 0) + points,
    }));
    const newSpend = (userSpend[userId] || 0) + orderTotal;
    setUserSpend((prev) => ({ ...prev, [userId]: newSpend }));

    // Kiểm tra lên cấp — tặng voucher mới
    const newLevel = loyaltyPrograms.find(
      (lp) => newSpend >= lp.minSpend && newSpend <= lp.maxSpend
    );
    if (newLevel) {
      newLevel.voucherIds.forEach((vid) => grantVoucher(userId, vid));
    }
    return points;
  }, [getUserLevel, userSpend, loyaltyPrograms, grantVoucher]);

  // Tặng voucher cho user mới
  const grantWelcomeVoucher = useCallback((userId) => {
    grantVoucher(userId, "V001");
    grantVoucher(userId, "V002");
  }, [grantVoucher]);

  // Admin: thêm voucher
  const addVoucher = useCallback((voucher) => {
    const newV = { ...voucher, id: `V${Date.now()}`, used: 0, active: true };
    setVouchers((prev) => [...prev, newV]);
  }, []);

  // Admin: cập nhật voucher
  const updateVoucher = useCallback((id, updated) => {
    setVouchers((prev) => prev.map((v) => v.id === id ? { ...v, ...updated } : v));
  }, []);

  // Admin: xóa voucher
  const deleteVoucher = useCallback((id) => {
    setVouchers((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const value = useMemo(() => ({
    vouchers, loyaltyPrograms, userVouchers, userPoints, userSpend,
    getUserLevel, getUserVouchers, validateVoucher, applyVoucher,
    grantVoucher, grantWelcomeVoucher, addPointsAndSpend,
    addVoucher, updateVoucher, deleteVoucher,
  }), [vouchers, loyaltyPrograms, userVouchers, userPoints, userSpend,
    getUserLevel, getUserVouchers, validateVoucher, applyVoucher,
    grantVoucher, grantWelcomeVoucher, addPointsAndSpend,
    addVoucher, updateVoucher, deleteVoucher]);

  return (
    <VoucherContext.Provider value={value}>
      {children}
    </VoucherContext.Provider>
  );
}

export function useVoucher() {
  return useContext(VoucherContext);
}
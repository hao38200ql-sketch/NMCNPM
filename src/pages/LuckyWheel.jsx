import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

const REWARDS = [
  { id: "V200K", name: "Voucher 200K", probability: 2, color: "#e53e3e" },
  { id: "V30PERCENT", name: "Giảm 30%", probability: 10, color: "#d69e2e" },
  { id: "MISS", name: "Chúc may mắn", probability: 88, color: "#718096" }
];

export default function LuckyWheel() {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [resultMessage, setResultMessage] = useState("");

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("wheel_inventory");
    return saved ? JSON.parse(saved) : { V200K: 1, V30PERCENT: 5 };
  });

  const currentSpins = user?.spinCount || 0;

  const spinWheel = () => {
    if (currentSpins <= 0 || isSpinning) return;

    setIsSpinning(true);
    setResultMessage("");

    let randomNum = Math.random() * 100;
    let cumulative = 0;
    let selectedReward = REWARDS.find(r => r.id === "MISS"); 

    for (let reward of REWARDS) {
      cumulative += reward.probability;
      if (randomNum <= cumulative) {
        if (reward.id !== "MISS" && inventory[reward.id] > 0) {
          selectedReward = reward;
        }
        break; 
      }
    }

    const sectionAngle = 360 / REWARDS.length;
    const targetIndex = REWARDS.findIndex(r => r.id === selectedReward.id);
    const centerAngle = (targetIndex * sectionAngle) + (sectionAngle / 2);
    const extraSpins = (Math.floor(Math.random() * 4) + 5) * 360; 
    const currentMod = rotation % 360;
    const spinToZero = 360 - currentMod; 
    const targetRotation = rotation + spinToZero + extraSpins + (360 - centerAngle);

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      
      let message = "";
      if (selectedReward.id !== "MISS") {
        message = `🎉 Xin chúc mừng! Bạn trúng: ${selectedReward.name}`;
        const newInventory = { ...inventory, [selectedReward.id]: inventory[selectedReward.id] - 1 };
        setInventory(newInventory);
        localStorage.setItem("wheel_inventory", JSON.stringify(newInventory));
        
        addNotification(`🎊 Bạn đã trúng ${selectedReward.name} từ Vòng Quay May Mắn!`);
      } else {
        message = "😔 " + selectedReward.name + " lần sau nhé!";
      }
      setResultMessage(message);

      updateProfile({
        ...user,
        spinCount: currentSpins - 1, 
        spinHistory: [
          {
            date: new Date().toISOString(),
            rewardName: selectedReward.name,
            rewardId: selectedReward.id,
            status: selectedReward.id !== "MISS" ? "Thành công" : "Trượt"
          },
          ...(user.spinHistory || [])
        ]
      });

    }, 4000);
  };

  if (!user) {
    return (
      <div style={styles.accessDenied}>
        <p style={{ fontSize: "64px", margin: 0 }}>🎁</p>
        <h2>Vui lòng đăng nhập để tham gia vòng quay</h2>
        <button style={styles.loginBtn} onClick={() => navigate("/login")}>Đăng nhập ngay</button>
      </div>
    );
  }

  const conicGradientString = REWARDS.map((r, i) => {
    const angleStep = 360 / REWARDS.length;
    return `${r.color} ${i * angleStep}deg ${(i + 1) * angleStep}deg`;
  }).join(", ");

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate("/")}>← Về trang chủ</button>
        
        <div style={styles.headerBox}>
          <h1 style={styles.title}>🎁 Vòng Quay May Mắn</h1>
          <p style={styles.subtitle}>
            Bạn đang có <span style={styles.highlight}>{currentSpins}</span> lượt quay
          </p>
          <p style={styles.ruleText}>
            *Nhận <strong>1 lượt quay</strong> khi thanh toán đơn hàng có giá trị từ <strong>200.000đ</strong> trở lên.
          </p>
        </div>

        <div style={styles.wheelWrapper}>
          <div style={styles.pointer}>▼</div>
          <div 
            style={{ 
              ...styles.wheel, 
              background: `conic-gradient(${conicGradientString})`,
              transform: `rotate(${rotation}deg)` 
            }}
          >
            {REWARDS.map((reward, index) => {
              const angle = (360 / REWARDS.length) * index + (360 / REWARDS.length) / 2;
              return (
                <div 
                  key={reward.id} 
                  style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <span style={styles.wheelText}>{reward.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button 
          style={{ ...styles.spinBtn, opacity: (currentSpins <= 0 || isSpinning) ? 0.5 : 1 }} 
          onClick={spinWheel}
          disabled={currentSpins <= 0 || isSpinning}
        >
          {isSpinning ? "ĐANG QUAY..." : "QUAY NGAY"}
        </button>

        {resultMessage && <div style={styles.resultBox}>{resultMessage}</div>}

        {(user.spinHistory && user.spinHistory.length > 0) && (
          <div style={styles.historyBox}>
            <h3 style={styles.historyTitle}>📜 Lịch sử quay thưởng của bạn</h3>
            <div style={styles.historyList}>
              {user.spinHistory.slice(0, 5).map((history, idx) => (
                <div key={idx} style={styles.historyItem}>
                  <span style={{fontSize: "12px", color: "#718096"}}>
                    {new Date(history.date).toLocaleDateString("vi-VN")}
                  </span>
                  <span style={{
                    fontWeight: "700", 
                    color: history.rewardId !== "MISS" ? "#38a169" : "#a0aec0"
                  }}>
                    {history.rewardName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f7fafc", minHeight: "100vh", fontFamily: "sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", padding: "40px 16px", display: "flex", flexDirection: "column", alignItems: "center" },
  accessDenied: { textAlign: "center", padding: "80px", backgroundColor: "#f7fafc", minHeight: "100vh" },
  loginBtn: { backgroundColor: "#38a169", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "600", marginTop: "16px" },
  backBtn: { alignSelf: "flex-start", background: "none", border: "none", color: "#38a169", fontSize: "14px", fontWeight: "600", cursor: "pointer", padding: "0 0 20px" },
  headerBox: { textAlign: "center", marginBottom: "30px" },
  title: { color: "#276749", fontSize: "32px", fontWeight: "900", margin: "0 0 8px" },
  subtitle: { color: "#4a5568", fontSize: "18px", margin: "0 0 8px" },
  highlight: { color: "#e53e3e", fontWeight: "800", fontSize: "24px" },
  ruleText: { fontSize: "13px", color: "#e53e3e", backgroundColor: "#fff5f5", padding: "8px 16px", borderRadius: "8px", display: "inline-block", border: "1px dashed #feb2b2" },
  wheelWrapper: { position: "relative", width: "320px", height: "320px", marginBottom: "40px", borderRadius: "50%", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" },
  pointer: { position: "absolute", top: "-25px", left: "50%", transform: "translateX(-50%)", fontSize: "40px", color: "#2d3748", zIndex: 10, filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.2))" },
  wheel: { width: "100%", height: "100%", borderRadius: "50%", border: "8px solid #cbd5e0", position: "relative", overflow: "hidden", transition: "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" },
  wheelText: { position: "absolute", top: "30px", left: "50%", transform: "translateX(-50%)", color: "white", fontWeight: "800", fontSize: "16px", textAlign: "center", textShadow: "1px 1px 3px rgba(0,0,0,0.6)", width: "120px" },
  spinBtn: { backgroundColor: "#e53e3e", color: "white", border: "none", padding: "16px 48px", borderRadius: "30px", fontSize: "18px", fontWeight: "900", cursor: "pointer", boxShadow: "0 6px 20px rgba(229,62,62,0.4)", transition: "transform 0.1s", letterSpacing: "1px" },
  resultBox: { marginTop: "24px", padding: "16px 32px", backgroundColor: "#c6f6d5", color: "#22543d", borderRadius: "12px", fontWeight: "800", fontSize: "16px", border: "2px solid #9ae6b4", textAlign: "center", width: "100%", boxSizing: "border-box" },
  historyBox: { marginTop: "32px", width: "100%", backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", boxSizing: "border-box" },
  historyTitle: { margin: "0 0 16px", color: "#2d3748", fontSize: "16px", borderBottom: "2px solid #f0f4f8", paddingBottom: "10px" },
  historyList: { display: "flex", flexDirection: "column", gap: "10px" },
  historyItem: { display: "flex", justifyContent: "space-between", fontSize: "14px", padding: "8px 0", borderBottom: "1px dashed #e2e8f0" }
};
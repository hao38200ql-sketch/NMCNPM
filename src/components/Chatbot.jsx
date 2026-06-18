import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Chào bạn! Mình là trợ lý ảo của FoodMart 🌿. Mình có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Bộ não "mini" của Bot: Trả lời theo từ khóa
  const getBotResponse = (userText) => {
    const text = userText.toLowerCase();
    if (text.includes('giao hàng') || text.includes('ship')) {
      return 'Bên mình miễn phí giao hàng cho đơn từ 200.000đ nhé. Thời gian giao từ 2-4 giờ trong nội thành Hà Nội 🚚.';
    }
    if (text.includes('thanh toán') || text.includes('tiền')) {
      return 'FoodMart hỗ trợ thanh toán khi nhận hàng (COD), quẹt thẻ hoặc quét mã QR VNPay ạ 💳.';
    }
    if (text.includes('địa chỉ') || text.includes('ở đâu')) {
      return 'Cửa hàng chính của FoodMart nằm tại PTIT, Hà Nội bạn nhé 📍.';
    }
    if (text.includes('voucher') || text.includes('giảm giá')) {
      return 'Bạn có thể xem các mã giảm giá trong phần "Voucher" trên thanh Menu, hoặc mua đơn trên 200k để nhận 1 lượt quay may mắn nha 🎁!';
    }
    return 'Dạ, câu hỏi này mình chưa hiểu rõ lắm. Bạn có thể để lại số điện thoại, nhân viên tư vấn sẽ liên hệ lại ngay ạ! Hoặc bạn thử hỏi về "Giao hàng", "Thanh toán", "Voucher" xem sao.';
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Thêm tin nhắn của User
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Giả lập bot đang "suy nghĩ" 1 giây rồi trả lời
    setTimeout(() => {
      const botReply = getBotResponse(input);
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 1000);
  };

  return (
    <>
      {/* Nút bấm tròn nổi ở góc */}
      <button 
        style={styles.floatingBtn} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✖' : '💬'}
      </button>

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <div>
              <h4 style={styles.title}>Trợ lý FoodMart</h4>
              <span style={styles.status}>🟢 Đang trực tuyến</span>
            </div>
          </div>

          <div style={styles.messageBox}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                ...styles.messageWrapper,
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {msg.sender === 'bot' && <div style={styles.botAvatar}>🌿</div>}
                <div style={{
                  ...styles.bubble,
                  backgroundColor: msg.sender === 'user' ? '#16a34a' : '#f3f4f6',
                  color: msg.sender === 'user' ? 'white' : '#1f2937',
                  borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form style={styles.inputArea} onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Nhập câu hỏi của bạn..." 
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" style={styles.sendBtn}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}

const styles = {
  floatingBtn: {
    position: 'fixed', bottom: '24px', right: '24px', width: '60px', height: '60px',
    borderRadius: '50%', backgroundColor: '#16a34a', color: 'white', fontSize: '28px',
    border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.2s'
  },
  chatWindow: {
    position: 'fixed', bottom: '96px', right: '24px', width: '350px', height: '480px',
    backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    zIndex: 9998, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    border: '1px solid #e5e7eb', fontFamily: 'sans-serif'
  },
  header: {
    backgroundColor: '#16a34a', padding: '16px', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  },
  title: { margin: 0, fontSize: '16px', fontWeight: '700' },
  status: { fontSize: '12px', color: '#dcfce7' },
  messageBox: {
    flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#f9fafb',
    display: 'flex', flexDirection: 'column', gap: '12px'
  },
  messageWrapper: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  botAvatar: {
    width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dcfce7',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
  },
  bubble: { maxWidth: '75%', padding: '10px 14px', fontSize: '14px', lineHeight: '1.5', wordWrap: 'break-word' },
  inputArea: {
    padding: '12px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white',
    display: 'flex', gap: '8px', alignItems: 'center'
  },
  input: {
    flex: 1, padding: '10px 14px', borderRadius: '999px', border: '1px solid #d1d5db',
    outline: 'none', fontSize: '14px'
  },
  sendBtn: {
    backgroundColor: '#16a34a', color: 'white', border: 'none', width: '36px', height: '36px',
    borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
  }
};
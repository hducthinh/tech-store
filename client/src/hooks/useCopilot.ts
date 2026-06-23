import { useState } from "react";

export function useCopilot() {
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: "assistant", content: "Xin chào! Tôi là Trợ lý AI Kỹ Thuật (Tech Copilot) chuyên sâu về server, workstation và hệ thống từ TechStore. Tôi có thể giúp bạn setup cấu hình hoặc tra cứu thông số hôm nay?", timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }
  ]);
  const [userInputMessage, setUserInputMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    const msg = text || userInputMessage;
    if (!msg.trim()) return;

    setUserInputMessage("");
    
    const userMsg: Message = {
      role: "user",
      content: msg,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setAiLoading(true);

    try {
      const conversationalHistory = chatMessages.slice(-10);

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: conversationalHistory
        })
      });

      const data = await res.json();
      
      const aiReply: Message = {
        role: "assistant",
        content: data.reply || "Tôi gặp trục trặc kỹ thuật khi kết nối hệ thống. Bạn có thể hỏi lại sau.",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };

      setChatMessages(prev => [...prev, aiReply]);

    } catch (err: any) {
      console.error("Gemini Chat Endpoint Fail:", err);
      const errReply: Message = {
        role: "assistant",
        content: `Tôi phát hiện lỗi hệ thống kết nối AI (${err.message}). Bạn vui lòng thực hiện kiểm tra GEMINI_API_KEY ở cài đặt.`,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages(prev => [...prev, errReply]);
    } finally {
      setAiLoading(false);
    }
  };

  const chatSuggestions = [
    "Cần cấu hình thiết bị khoảng 50 triệu học AI Deep Learning?",
    "MacBook Pro M3 Max gõ code có êm bằng Keychron Q1 Max không?",
    "Văn phòng Dev cần màn hình LG UltraFine dùng cổng C sạc nhanh không?",
    "Các cấu hình workstation khuyên dùng từ TechStore?"
  ];

  return {
    chatMessages,
    userInputMessage,
    setUserInputMessage,
    aiLoading,
    handleSendMessage,
    chatSuggestions
  };
}

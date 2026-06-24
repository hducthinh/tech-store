import { useState } from "react";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

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

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      const baseUrl = apiUrl.replace(/\/v1\/?$/, "");

      const res = await fetch(`${baseUrl}/copilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: conversationalHistory
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }

      // Tạo sẵn một tin nhắn trống cho AI
      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let buffer = "";
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || "";
            
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.substring(6);
                if (dataStr.trim() === "[DONE]") {
                  done = true;
                  break;
                }
                try {
                  const data = JSON.parse(dataStr);
                  if (data.error) {
                    throw new Error(data.error);
                  }
                  if (data.text) {
                    setChatMessages(prev => {
                      const newMsgs = [...prev];
                      const lastIdx = newMsgs.length - 1;
                      if (newMsgs[lastIdx].role === "assistant") {
                        newMsgs[lastIdx] = {
                          ...newMsgs[lastIdx],
                          content: newMsgs[lastIdx].content + data.text
                        };
                      }
                      return newMsgs;
                    });
                  }
                } catch (e) {
                  // ignore JSON parse errors
                }
              }
            }
          }
        }
      }

    } catch (err: any) {
      console.error("Gemini Chat Endpoint Fail:", err);
      const errReply: Message = {
        role: "assistant",
        content: `Tôi phát hiện lỗi hệ thống kết nối AI (${err.message}). Bạn vui lòng thử lại sau.`,
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
    setChatMessages,
    userInputMessage,
    setUserInputMessage,
    aiLoading,
    handleSendMessage,
    chatSuggestions
  };
}

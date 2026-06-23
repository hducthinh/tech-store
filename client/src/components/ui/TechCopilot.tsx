import React from "react";
import { Sparkles, Info, Send } from "lucide-react";

interface TechCopilotProps {
  chatMessages: Message[];
  setChatMessages: (messages: Message[]) => void;
  userInputMessage: string;
  setUserInputMessage: (msg: string) => void;
  aiLoading: boolean;
  handleSendMessage: (text: string) => void;
  chatSuggestions: string[];
}

export function TechCopilot({
  chatMessages,
  setChatMessages,
  userInputMessage,
  setUserInputMessage,
  aiLoading,
  handleSendMessage,
  chatSuggestions
}: TechCopilotProps) {
  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row min-h-[500px] overflow-hidden">
      
      {/* Sidebar information panel: available store context */}
      <div className="w-full md:w-[320px] bg-slate-50 border-r border-slate-200 p-5 flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#00236f]">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300" />
            <h3 className="font-bold text-sm tracking-tight">TechStore Copilot</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nhận tư vấn cấu hình PC đồ học, máy trạm AI hoặc kiểm tra sự tương thích linh kiện trực tiếp từ Trí tuệ Nhân tạo Gemini 3.5.
          </p>
          <div className="border-t border-slate-200 pt-3 space-y-2">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Thông tin Cửa hàng nạp vào AI:</p>
            <p className="text-[11px] font-medium text-slate-700 bg-white p-2 rounded border border-slate-200">
              💡 <strong>Smart Memory:</strong> AI đang ghi nhớ 8 dòng sản phẩm tối tân của TechStore và giá chiết khấu 15% hè 2026.
            </p>
          </div>
        </div>

        {/* Information disclaimer info note */}
        <div className="p-3 bg-blue-50/60 rounded-lg flex gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-800 leading-normal">
            Chương trình chạy bảo mật thông qua máy chủ cục bộ Cloud Run, dữ liệu của bạn được ẩn danh hoàn toàn.
          </p>
        </div>
      </div>

      {/* Conversation Window */}
      <div className="flex-1 flex flex-col justify-between h-[550px] bg-white">
        
        {/* Header inside chat */}
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <p className="text-xs font-semibold text-slate-700">Trợ lý AI thời gian thực</p>
          </div>
          <button 
            onClick={() => setChatMessages([{
              role: "assistant",
              content: `Chào bạn quay lại! Hãy hỏi tôi bất cứ cấu hình phần cứng chuyên nghiệp nào của TechStore.`,
              timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
            }])}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
          >
            Xóa lịch sử chat
          </button>
        </div>

        {/* Chat screen logs wrapper */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
              
              {/* Role circle avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${msg.role === "user" ? "bg-[#00236f] text-white" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"}`}>
                {msg.role === "user" ? "Khách" : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Chat Bubble card */}
              <div className={`p-4 rounded-2xl ${msg.role === "user" ? "bg-[#0058be] text-white rounded-tr-none" : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none font-sans"}`}>
                <p className="text-sm whitespace-pre-line leading-relaxed">
                  {msg.content}
                </p>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-[9px] block ${msg.role === "user" ? "text-white/60" : "text-slate-400"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>

            </div>
          ))}

          {aiLoading && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested template questions buttons */}
        <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex gap-2 overflow-x-auto select-none">
          {chatSuggestions.map((s, idx) => (
            <button 
              key={idx}
              onClick={() => handleSendMessage(s)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#0058be] text-slate-600 hover:text-[#0058be] text-[11px] font-semibold rounded-lg shadow-sm transition whitespace-nowrap cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Form Input field for sending custom questions */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(""); }}
          className="p-4 border-t border-slate-200 bg-white flex gap-2 items-center"
        >
          <input 
            type="text"
            placeholder="Hỏi AI cấu hình máy trạm tối ưu..."
            value={userInputMessage}
            onChange={(e) => setUserInputMessage(e.target.value)}
            disabled={aiLoading}
            className="flex-1 py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:bg-white disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={aiLoading || !userInputMessage.trim()}
            className="p-3.5 bg-[#0058be] text-white hover:bg-[#00236f] disabled:opacity-30 rounded-xl transition cursor-pointer flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}

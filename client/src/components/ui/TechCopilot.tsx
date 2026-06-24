import React, { useRef, useEffect } from "react";
import { Sparkles, Info, Send, X } from "lucide-react";
import { Message } from "../../hooks/useCopilot";

interface TechCopilotProps {
  chatMessages: Message[];
  setChatMessages: (messages: Message[]) => void;
  userInputMessage: string;
  setUserInputMessage: (msg: string) => void;
  aiLoading: boolean;
  handleSendMessage: (text: string) => void;
  chatSuggestions: string[];
  onClose?: () => void;
}

export function TechCopilot({
  chatMessages,
  setChatMessages,
  userInputMessage,
  setUserInputMessage,
  aiLoading,
  handleSendMessage,
  chatSuggestions,
  onClose
}: TechCopilotProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, aiLoading]);

  // Auto-focus input after AI finishes loading
  useEffect(() => {
    if (!aiLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [aiLoading]);

  return (
    <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-xl flex flex-col h-full overflow-hidden relative">
      
      {/* Decorative gradient background blur */}
      <div className="absolute top-[-50%] left-[-10%] w-[120%] h-64 bg-gradient-to-br from-[#0058be]/10 to-amber-500/5 blur-3xl rounded-full pointer-events-none opacity-50"></div>

      {/* Conversation Window */}
      <div className="flex-1 flex flex-col justify-between h-full bg-transparent relative z-10 overflow-hidden">
        
        {/* Premium Header */}
        <div className="px-6 py-4 border-b border-slate-200/50 flex justify-between items-center bg-white/50 backdrop-blur-md z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-[#00236f] to-[#0058be] rounded-xl shadow-md">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-2">
                TechStore Copilot
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider">AI</span>
              </h3>
              <p className="text-xs font-medium text-slate-500">Trợ lý công nghệ thời gian thực</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setChatMessages([{
                role: "assistant",
                content: `Chào bạn! Tôi là TechStore Copilot. Hãy hỏi tôi bất cứ cấu hình phần cứng hoặc thiết bị công nghệ nào của cửa hàng.`,
                timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
              }])}
              title="Làm mới cuộc trò chuyện"
              className="text-xs px-3 py-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 font-semibold rounded-lg transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              Làm mới
            </button>
            {onClose && (
              <button
                onClick={onClose}
                title="Đóng AI và quay về trang chủ"
                className="p-1.5 bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Chat screen logs wrapper */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 scroll-smooth min-h-0">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 md:gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              
              {/* Role avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold shadow-sm transition-transform group-hover:scale-105 ${msg.role === "user" ? "bg-gradient-to-br from-[#00236f] to-[#0058be] text-white" : "bg-gradient-to-br from-amber-400 to-orange-500 text-white"}`}>
                {msg.role === "user" ? <span className="text-xs">Bạn</span> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Chat Bubble card */}
              <div className={`relative p-3 md:p-4 rounded-2xl shadow-sm ${msg.role === "user" ? "bg-gradient-to-br from-[#0058be] to-[#0074f0] text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none font-sans"}`}>
                <p className="text-sm whitespace-pre-line leading-relaxed break-words">
                  {msg.content}
                </p>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-[10px] font-medium block ${msg.role === "user" ? "text-blue-100" : "text-slate-400"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>

            </div>
          ))}

          {aiLoading && (
            <div className="flex gap-4 max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="p-3 md:p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested template questions buttons */}
        {chatMessages.length <= 1 && (
          <div className="px-6 py-3 bg-slate-50/80 backdrop-blur-sm border-t border-slate-200/50 flex gap-2 overflow-x-auto select-none no-scrollbar shrink-0">
            {chatSuggestions.slice(0, 2).map((s, idx) => (
              <button 
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-[#0058be] hover:shadow-md text-slate-600 hover:text-[#0058be] text-xs font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer transform active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Form Input field for sending custom questions */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(""); }}
          className="p-3 md:p-4 border-t border-slate-200 bg-white/80 backdrop-blur-md flex gap-2 items-center shrink-0 z-10"
        >
          <input 
            ref={inputRef}
            type="text"
            placeholder="Bạn cần TechStore tư vấn gì hôm nay?..."
            value={userInputMessage}
            onChange={(e) => setUserInputMessage(e.target.value)}
            disabled={aiLoading}
            className="flex-1 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]/50 focus:border-[#0058be] focus:bg-white disabled:opacity-60 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={aiLoading || !userInputMessage.trim()}
            className="p-3 bg-gradient-to-r from-[#00236f] to-[#0058be] text-white hover:shadow-lg disabled:opacity-40 disabled:hover:shadow-none rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center transform active:scale-95 hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}

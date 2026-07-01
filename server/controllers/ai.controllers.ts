// @ts-nocheck
// server/controllers/ai.controllers.js
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const SYSTEM_PROMPT = `Bạn là TechStore Copilot — trợ lý tư vấn phần cứng chuyên nghiệp của cửa hàng TechStore Pro Hardware.

Chuyên môn của bạn:
- Tư vấn cấu hình PC gaming, workstation, máy trạm AI/Deep Learning.
- Kiểm tra tương thích linh kiện (RAM, CPU, Mainboard, PSU, Case).
- Gợi ý sản phẩm theo ngân sách và nhu cầu.
- Giải thích thông số kỹ thuật đơn giản, dễ hiểu.

Danh mục sản phẩm TechStore hiện có: CPU, VGA, RAM, Mainboard, Ổ cứng SSD, Nguồn, Tản nhiệt, Case, Màn hình, Laptop Gaming, Bàn phím, Chuột, Tai nghe, Loa, Ghế gaming.

Nguyên tắc trả lời:
- Luôn trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.
- Câu trả lời ngắn gọn, có cấu trúc rõ ràng (dùng gạch đầu dòng nếu cần).
- Nếu câu hỏi nằm ngoài lĩnh vực phần cứng/công nghệ, hãy lịch sự từ chối và đề nghị hỏi về cấu hình máy tính.`;

export const chat = asyncHandler(async (req: any, res: any, next: any) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return next(new ApiError("GROQ_API_KEY chưa được cấu hình", 500));
  }

  const { message, history = [] } = req.body;
  if (!message?.trim()) {
    return next(new ApiError("Tin nhắn không được để trống", 400));
  }

  // Chuyển lịch sử chat sang định dạng của OpenAI/Groq API
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    // Bỏ qua tin nhắn chào đầu tiên của bot nếu có
    ...history
      .filter((m) => m.role !== "assistant" || m.content !== history[0]?.content)
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      })),
    { role: "user", content: message }
  ];

  // Thiết lập Headers cho Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        stream: true,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error("Mô hình AI đang quá tải (Rate Limited). Vui lòng thử lại sau vài giây.");
      }
      throw new Error(errData.error?.message || `Lỗi kết nối Groq: HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
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
              const dataStr = line.substring(6).trim();
              if (dataStr === "[DONE]") {
                done = true;
                break;
              }
              if (!dataStr) continue;

              try {
                const data = JSON.parse(dataStr);
                const contentChunk = data.choices?.[0]?.delta?.content;
                if (contentChunk) {
                  // Gửi từng phần dữ liệu cho client theo chuẩn SSE đang dùng
                  res.write(`data: ${JSON.stringify({ text: contentChunk })}\n\n`);
                }
              } catch (e) {
                // ignore JSON parse error for incomplete chunks
              }
            }
          }
        }
      }
    }

    // Đánh dấu kết thúc stream
    res.write("data: [DONE]\n\n");
    res.end();

  } catch (error) {
    console.error("[AI] Groq API error:", error);

    if (!res.headersSent) {
      return next(new ApiError(error.message || "Lỗi kết nối đến AI. Vui lòng thử lại sau.", 502));
    }

    res.write(`data: ${JSON.stringify({ error: "Lỗi kết nối đến AI hoặc bị ngắt quãng." })}\n\n`);
    res.end();
  }
});



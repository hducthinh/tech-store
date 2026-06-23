// server/controllers/ai.controllers.js
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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

export const chat = catchAsync(async (req, res, next) => {
  if (!GEMINI_API_KEY) {
    return next(new AppError("GEMINI_API_KEY chưa được cấu hình", 500));
  }

  const { message, history = [] } = req.body;
  if (!message?.trim()) {
    return next(new AppError("Tin nhắn không được để trống", 400));
  }

  // Chuyển lịch sử chat sang định dạng Gemini
  const contents = [
    // System prompt giả lập bằng tin nhắn đầu tiên của model
    { role: "user", parts: [{ text: "Bạn là ai?" }] },
    { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
    // Lịch sử hội thoại (bỏ tin nhắn chào đầu tiên của bot)
    ...history
      .filter(m => m.role !== "assistant" || m.content !== history[0]?.content)
      .map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      })),
    // Tin nhắn hiện tại
    { role: "user", parts: [{ text: message }] }
  ];

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    console.error("[AI] Gemini API error:", response.status, JSON.stringify(errData));
    // 429 = rate limit / quota exceeded
    const userMsg = response.status === 429
      ? "Hệ thống AI đang bận, vui lòng thử lại sau vài giây."
      : "Lỗi kết nối đến AI. Vui lòng thử lại sau.";
    return next(new AppError(userMsg, 502));
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    return next(new AppError("AI không trả về kết quả hợp lệ.", 502));
  }

  res.status(200).json({ reply });
});

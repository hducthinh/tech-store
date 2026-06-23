import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import apiRoutes from "./routes/index.js";
import dns from "dns";

// Cấu hình DNS mặc định cho Node.js tránh lỗi ECONNREFUSED khi phân giải MongoDB SRV
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("[Server] Không thể cấu hình DNS Google:", e.message);
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Bảo vệ HTTP Headers với Helmet
app.use(helmet());

// 2. Cấu hình CORS chặt chẽ
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// 3. Giới hạn số lượng request (Rate Limiting) chống Brute-force/DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 100, // Mỗi IP tối đa 100 request
  message: {
    status: "fail",
    message: "Hệ thống phát hiện quá nhiều yêu cầu từ IP của bạn. Vui lòng thử lại sau 15 phút."
  }
});
app.use("/api", limiter);

// 4. Phân tích body JSON
app.use(express.json({ limit: "10kb" })); // Giới hạn payload size

// 5. Phòng chống NoSQL Query Injection (Sanitize dữ liệu đầu vào)
// Fix Express 5 error (Cannot set property query which has only a getter)
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});

// Đường dẫn thử nghiệm chạy gốc
app.get("/", (req, res) => {
  res.send(
    "Chúc mừng Thịnh! Server Tech_Store đã chạy thành công vù vù rồi nhé!",
  );
});

app.use("/api", apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Không tìm thấy endpoint.",
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    status: err.status || "error",
    message: err.message || "Có lỗi xảy ra.",
  };

  if (err.errors) {
    payload.errors = err.errors;
  }

  if (process.env.NODE_ENV === "development") {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
});

const startServer = () => {
  app.listen(PORT, () => {
    console.log(
      `[Server] Server đang chạy mượt mà tại cổng: http://localhost:${PORT}`,
    );
  });
};

const mongoUri = process.env.MONGO_URI;
// THÊM DÒNG NÀY ĐỂ CHECK:
console.log(">>> Kiểm tra chuỗi kết nối nhận được: ", mongoUri);
if (!mongoUri) {
  console.warn("[Server] MONGO_URI chưa được cấu hình, bỏ qua kết nối DB.");
  startServer();
} else {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("[Server] Kết nối MongoDB thành công.");
      startServer();
    })
    .catch((error) => {
      console.error("[Server] Kết nối MongoDB thất bại:", error);
      process.exitCode = 1;
    });
}
// Trigger nodemon restart
// 

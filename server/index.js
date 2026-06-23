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

// Trust reverse proxy (quan trọng khi deploy lên Render/Heroku/Vercel) để express-rate-limit hoạt động đúng
app.set("trust proxy", 1);

// 1. Bảo vệ HTTP Headers với Helmet
app.use(helmet());

const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : ["http://localhost:5173"];

// 2. Cấu hình CORS chặt chẽ
app.use(cors({
  origin: function (origin, callback) {
    // Cho phép requests không có origin (như mobile apps, curl) hoặc origin nằm trong danh sách
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// 3. Giới hạn số lượng request (Rate Limiting) chống Brute-force/DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 1000, // Mỗi IP tối đa 100 request
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

// Health check route (Nhẹ nhàng, dùng để ping giữ server luôn thức)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api", apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Không tìm thấy endpoint.",
  });
});

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Có lỗi xảy ra.";

  // 1. Lỗi Mongoose Validation (Để trống hoặc giá trị âm)
  if (err.name === "ValidationError") {
    statusCode = 400;
    status = "fail";
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Dữ liệu không hợp lệ: ${errors.join(". ")}`;
  }

  // 2. Lỗi trùng lặp dữ liệu (Duplicate Key - Ví dụ: SKU trùng)
  if (err.code === 11000) {
    statusCode = 400;
    status = "fail";
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `Dữ liệu bị trùng lặp: ${field} = '${value}'. Vui lòng sử dụng giá trị khác.`;
  }

  // 3. Lỗi upload ảnh sai định dạng (Multer/Cloudinary)
  if (err.message && err.message.includes("allowed_formats")) {
    statusCode = 400;
    status = "fail";
    message = "File không đúng định dạng. Chỉ chấp nhận các định dạng ảnh: jpg, png, jpeg, webp.";
  } else if (err.name === "MulterError") {
    statusCode = 400;
    status = "fail";
    message = `Lỗi tải file lên: ${err.message}`;
  }

  const payload = { status, message };

  if (process.env.NODE_ENV === "development") {
    payload.stack = err.stack;
    if (err.errors) payload.rawErrors = err.errors;
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

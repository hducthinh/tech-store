import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import apiRoutes from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

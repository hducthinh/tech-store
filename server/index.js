import express from "express";

const app = express();
const PORT = 5000;

// Đường dẫn thử nghiệm chạy gốc
app.get("/", (req, res) => {
  res.send(
    "Chúc mừng Thịnh! Server Tech_Store đã chạy thành công vù vù rồi nhé!",
  );
});

// Kích hoạt cổng lắng nghe của server
app.listen(PORT, () => {
  console.log(
    `[Server] Server đang chạy mượt mà tại cổng: http://localhost:${PORT}`,
  );
});

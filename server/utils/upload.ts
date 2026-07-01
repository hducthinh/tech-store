import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình Multer lưu trực tiếp lên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    // @ts-expect-error cloudinary params typing issue
    folder: (req, file) => {
      // Tự động phân loại thư mục lưu trữ dựa trên endpoint được gọi
      if (req.originalUrl.includes("/products")) return "tech-store/products";
      return "tech-store/reviews";
    },
    allowed_formats: ["jpg", "png", "jpeg", "webp"], // Các định dạng cho phép
    transformation: [
      { fetch_format: "auto", quality: "auto" }, // Tự động nén và chuyển sang webp cho nhẹ
      { width: 1000, height: 1000, crop: "limit" } // Giới hạn kích thước tối đa tránh user up ảnh 4K
    ]
  }
});

const upload = multer({ storage });

export default upload;

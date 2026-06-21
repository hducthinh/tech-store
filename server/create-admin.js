import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import dns from "node:dns";

dotenv.config();
dns.setServers(['8.8.8.8']);

// Temporary schema without length constraint just for this script,
// or just use native MongoDB driver methods to bypass mongoose validation.
import User from "./models/user.model.js";

async function createAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const email = "admin@techstore.com";
    const password = "admin";

    // Xóa user cũ nếu có
    await User.deleteOne({ email });

    // Tạo user mới bỏ qua validation
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.collection.insertOne({
      email,
      password: hashedPassword,
      fullName: "System Admin",
      phone: "0123456789",
      role: "admin",
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`Đã tạo tài khoản admin thành công!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

createAdmin();

import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";

dotenv.config();

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const mongoUri = process.env.MONGO_URI || "mongodb+srv://admin:admin@cluster0.eav9a.mongodb.net/tech-store?retryWrites=true&w=majority&appName=Cluster0";

async function cleanup() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    // Delete test users
    const resultUsers = await mongoose.connection.collection("users").deleteMany({
      email: { $regex: /^test_/ }
    });
    console.log(`Deleted ${resultUsers.deletedCount} test users.`);

    // Delete test products
    const resultProducts = await mongoose.connection.collection("products").deleteMany({
      name: { $regex: /test/i }
    });
    console.log(`Deleted ${resultProducts.deletedCount} test products.`);

    // Delete test orders
    const resultOrders = await mongoose.connection.collection("orders").deleteMany({
      "shippingAddress.fullName": "Test User"
    });
    console.log(`Deleted ${resultOrders.deletedCount} test orders.`);

    console.log("Cleanup completed!");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

cleanup();

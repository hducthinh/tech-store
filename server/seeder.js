// server/seeder.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import dns from "dns";
import Category from "./models/category.model.js";
import Brand from "./models/brand.model.js";
import Product from "./models/product.model.js";
import User from "./models/user.model.js";
import Cart from "./models/cart.model.js";
import Order from "./models/order.model.js";
import slugify from "./utils/slugify.js";

// Cấu hình DNS tránh lỗi ECONNREFUSED khi kết nối MongoDB Atlas SRV trên Node.js
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Không thể cấu hình DNS Google:", e.message);
}

dotenv.config();

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI không được cấu hình trong file .env!");
  process.exit(1);
}

const importData = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log(">>> Kết nối database thành công.");

    // 1. Dọn dẹp dữ liệu cũ trước khi nạp
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();
    console.log(">>> Đã dọn sạch dữ liệu cũ của tất cả 6 Collections.");

    // 2. Thêm Users mẫu (Mật khẩu mặc định: 123456)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const adminUser = await User.create({
      fullName: "Nguyễn Văn Admin",
      email: "admin@techstore.com",
      password: hashedPassword,
      phone: "0901234567",
      role: "admin",
      isActive: true,
    });

    const customerUser = await User.create({
      fullName: "Trần Thị Khách Hàng",
      email: "customer@techstore.com",
      password: hashedPassword,
      phone: "0987654321",
      role: "customer",
      isActive: true,
    });
    console.log(">>> Đã import Users (Mật khẩu đăng nhập đều là: 123456)");

    // 3. Thêm Danh Mục mẫu
    const categoriesData = [
      { name: "CPU", description: "Bộ vi xử lý trung tâm", displayOrder: 1 },
      { name: "VGA", description: "Card màn hình đồ họa", displayOrder: 2 },
      { name: "RAM", description: "Bộ nhớ trong", displayOrder: 3 },
      { name: "Mainboard", description: "Bo mạch chủ", displayOrder: 4 },
      { name: "SSD", description: "Ổ cứng thể rắn tốc độ cao", displayOrder: 5 },
    ];

    const createdCategories = [];
    for (const cat of categoriesData) {
      const slug = slugify(cat.name);
      const category = await Category.create({
        name: cat.name,
        slug,
        level: 1,
        path: slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
      });
      createdCategories.push(category);
    }
    console.log(">>> Đã import danh mục thành công.");

    // 4. Thêm Thương Hiệu mẫu
    const brandsData = [
      { name: "Intel", description: "Nhà sản xuất CPU hàng đầu thế giới" },
      { name: "AMD", description: "Thách thức thế giới CPU và GPU" },
      { name: "ASUS", description: "Linh kiện máy tính Asus" },
      { name: "MSI", description: "Linh kiện máy tính MSI" },
      { name: "GIGABYTE", description: "Bo mạch chủ & Card đồ họa Gigabyte" },
      { name: "Kingston", description: "RAM và SSD uy tín" },
    ];

    const createdBrands = [];
    for (const b of brandsData) {
      const brand = await Brand.create({
        name: b.name,
        slug: slugify(b.name),
        description: b.description,
      });
      createdBrands.push(brand);
    }
    console.log(">>> Đã import thương hiệu thành công.");

    // Hàm tiện ích tìm kiếm nhanh Object
    const findCat = (name) => createdCategories.find((c) => c.name === name);
    const findBrand = (name) => createdBrands.find((b) => b.name === name);

    // 5. Thêm Sản Phẩm mẫu
    const productsData = [
      {
        name: "Intel Core i5-13600K",
        categoryName: "CPU",
        brandName: "Intel",
        price: 7890000,
        originalPrice: 8500000,
        stock: 50,
        shortDescription: "Bộ vi xử lý Intel Core i5 thế hệ thứ 13, 14 nhân 20 luồng.",
        specs: { "Socket": "LGA1700", "Xung nhịp": "3.5GHz - 5.1GHz", "TDP": "125W" },
      },
      {
        name: "AMD Ryzen 5 7600X",
        categoryName: "CPU",
        brandName: "AMD",
        price: 6190000,
        originalPrice: 6900000,
        stock: 30,
        shortDescription: "Bộ vi xử lý AMD Ryzen 5 thế hệ 7000, socket AM5.",
        specs: { "Socket": "AM5", "Xung nhịp": "4.7GHz - 5.3GHz", "TDP": "105W" },
      },
      {
        name: "ASUS ROG Strix RTX 4060 Ti 8GB",
        categoryName: "VGA",
        brandName: "ASUS",
        price: 11990000,
        originalPrice: 13000000,
        stock: 15,
        shortDescription: "Card đồ họa NVIDIA RTX 4060 Ti phiên bản ROG Strix cao cấp.",
        specs: { "Bộ nhớ": "8GB GDDR6", "Nguồn yêu cầu": "650W", "Cổng kết nối": "3 x DisplayPort, 1 x HDMI" },
      },
      {
        name: "MSI GeForce RTX 4070 Ti SUPER 16GB Ventus 3X",
        categoryName: "VGA",
        brandName: "MSI",
        price: 24500000,
        originalPrice: 26000000,
        stock: 10,
        shortDescription: "Card màn hình hiệu năng cực khủng chuyên trị game 4K.",
        specs: { "Bộ nhớ": "16GB GDDR6X", "Nguồn yêu cầu": "750W", "Cơ chế tản": "Ventus 3X" },
      },
      {
        name: "Kingston Fury Beast 16GB (2x8GB) DDR5 5600MHz",
        categoryName: "RAM",
        brandName: "Kingston",
        price: 1650000,
        originalPrice: 1900000,
        stock: 100,
        shortDescription: "Ram máy tính DDR5 hiệu năng cao có tản nhiệt.",
        specs: { "Dung lượng": "16GB", "Bus": "5600MHz", "Loại RAM": "DDR5" },
      },
      {
        name: "ASUS TUF GAMING B760M-PLUS WIFI",
        categoryName: "Mainboard",
        brandName: "ASUS",
        price: 4350000,
        originalPrice: 4800000,
        stock: 25,
        shortDescription: "Bo mạch chủ ASUS dòng TUF Gaming siêu bền, hỗ trợ DDR5 và Wifi.",
        specs: { "Socket": "LGA1700", "Kích thước": "Micro-ATX", "Hỗ trợ RAM": "DDR5" },
      },
    ];

    const createdProducts = [];
    for (const prod of productsData) {
      const categoryObj = findCat(prod.categoryName);
      const brandObj = findBrand(prod.brandName);

      if (categoryObj && brandObj) {
        const product = await Product.create({
          name: prod.name,
          slug: slugify(prod.name),
          categoryId: categoryObj._id,
          categoryName: categoryObj.name,
          categoryPath: categoryObj.path,
          brandId: brandObj._id,
          brandName: brandObj.name,
          price: prod.price,
          originalPrice: prod.originalPrice,
          stock: prod.stock,
          shortDescription: prod.shortDescription,
          specs: prod.specs,
          isActive: true,
          isFeatured: true,
        });
        createdProducts.push(product);
      }
    }
    console.log(">>> Đã import sản phẩm thành công.");

    // 6. Thêm Giỏ Hàng mẫu cho Customer
    const testProduct1 = createdProducts[0]; // Intel Core i5
    const testProduct2 = createdProducts[4]; // RAM Kingston
    
    await Cart.create({
      userId: customerUser._id,
      items: [
        { productId: testProduct1._id, quantity: 1, price: testProduct1.price },
        { productId: testProduct2._id, quantity: 2, price: testProduct2.price },
      ],
    });
    console.log(">>> Đã import giỏ hàng mẫu.");

    // 7. Thêm Đơn Hàng mẫu cho Customer
    await Order.create({
      userId: customerUser._id,
      items: [
        {
          productId: testProduct2._id,
          name: testProduct2.name,
          quantity: 2,
          price: testProduct2.price,
        },
      ],
      shippingAddress: {
        fullName: "Trần Thị Khách Hàng",
        phone: "0987654321",
        address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
      },
      paymentMethod: "COD",
      isPaid: false,
      status: "PROCESSING",
      totalAmount: testProduct2.price * 2,
    });
    console.log(">>> Đã import đơn hàng mẫu.");

    console.log(">>> QUÁ TRÌNH SEED DỮ LIỆU HOÀN TẤT!");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi import dữ liệu: ", error);
    process.exit(1);
  }
};

importData();

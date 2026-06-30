import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import Product from "./models/product.model.js";

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const p = await Product.find({ categoryName: { $in: ["CPU", "Mainboard", "VGA", "Nguồn máy tính", "Bộ vi xử lý", "Bo mạch chủ"] } }).limit(20);
  console.log(JSON.stringify(p.map(x => ({ name: x.name, specs: x.specs })), null, 2));
  process.exit(0);
});

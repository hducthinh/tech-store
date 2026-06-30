import mongoose from "mongoose";
import dotenv from "dotenv";
import dashboardService from "./services/dashboard.service.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("DB Connected");
  const summary = await dashboardService.getSummary();
  console.log(summary);
  process.exit(0);
}).catch(console.error);


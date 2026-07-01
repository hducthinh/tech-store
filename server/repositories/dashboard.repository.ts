// @ts-nocheck
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import Setting from "../models/setting.model.js";

class DashboardRepository {
  async countOrders(filter = {}) {
    return await Order.countDocuments(filter);
  }

  async countProducts(filter = {}) {
    return await Product.countDocuments(filter);
  }

  async countUsers(filter = {}) {
    return await User.countDocuments(filter);
  }

  async aggregateOrders(pipeline) {
    return await Order.aggregate(pipeline);
  }

  async getAllCategories() {
    return await Category.find().select("name");
  }

  async getSalesGoal() {
    let salesGoalSetting = await Setting.findOne({ key: "monthlySalesGoal" });
    if (!salesGoalSetting) {
      salesGoalSetting = await Setting.create({ key: "monthlySalesGoal", value: 100000000, description: "M?c tiêu doanh thu tháng" });
    }
    return salesGoalSetting.value;
  }
}

export default new DashboardRepository();




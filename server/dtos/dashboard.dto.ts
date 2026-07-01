// @ts-nocheck
export class SummaryDTO {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
  revenueGrowth: string;
  orderGrowth: string;
  customerGrowth: string;
  productGrowth: string;
  salesGoal: number;
  activeProducts: number;
  inactiveProducts: number;
  currentMonthUsers: number;
  constructor(data) {
    this.revenue = data.totalRevenue || 0;
    this.orders = data.totalOrders || 0;
    this.products = data.totalProducts || 0;
    this.customers = data.totalUsers || 0;
    this.revenueGrowth = data.revenueChange || "+0%";
    this.orderGrowth = data.ordersChange || "+0%";
    this.customerGrowth = data.usersChange || "+0%";
    this.productGrowth = data.productGrowth || "+0%";
    
    this.salesGoal = data.salesGoal || 100000000;
    this.activeProducts = data.activeProducts || 0;
    this.inactiveProducts = data.inactiveProducts || 0;
    this.currentMonthUsers = data.currentMonthUsers || 0;
  }
}

export class RevenueChartDTO {
  date: string;
  revenue: number;
  orders: number;
  constructor(data) {
    this.date = data.date;
    this.revenue = data.revenue;
    this.orders = data.orders;
  }
}

export class CategoryRevenueDTO {
  name: string;
  revenue: number;
  percentage: number;
  color: string;
  constructor(data) {
    this.name = data.name;
    this.revenue = data.revenue;
    this.percentage = data.percentage;
    this.color = data.color;
  }
}




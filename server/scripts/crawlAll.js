import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Danh sách các mục cần crawl (đã bỏ qua Màn hình, PC GVN, Laptop Gaming)
const jobs = [
  { url: "https://gearvn.com/collections/laptop?nhucausudung=vanphong", keyword: "laptop", category: "Laptop" },
  { url: "https://gearvn.com/collections/cpu-bo-vi-xu-ly", keyword: "Bộ vi xử lý", category: "CPU" },
  { url: "https://gearvn.com/collections/mainboard-bo-mach-chu", keyword: "Bo mạch", category: "Mainboard" },
  { url: "https://gearvn.com/collections/vga-card-man-hinh", keyword: "Card màn hình", category: "VGA" },
  { url: "https://gearvn.com/collections/ram-pc", keyword: "Ram", category: "RAM" },
  { url: "https://gearvn.com/collections/ssd-o-cung-the-ran", keyword: "ssd", category: "Ổ cứng SSD" },
  { url: "https://gearvn.com/collections/case-thung-may-tinh", keyword: "Vỏ máy tính", category: "Case" },
  { url: "https://gearvn.com/collections/psu-nguon-may-tinh", keyword: "nguồn", category: "Nguồn" },
  { url: "https://gearvn.com/collections/tan-nhiet-may-tinh", keyword: "tản", category: "Tản nhiệt" },
  { url: "https://gearvn.com/collections/ban-phim-may-tinh", keyword: "bàn phím", category: "Bàn phím" },
  { url: "https://gearvn.com/collections/chuot-may-tinh", keyword: "chuột", category: "Chuột" },
  { url: "https://gearvn.com/collections/tai-nghe", keyword: "tai nghe", category: "Tai nghe" },
  { url: "https://gearvn.com/collections/loa", keyword: "loa", category: "Loa" },
  { url: "https://gearvn.com/collections/ghe-gaming", keyword: "ghế", category: "Ghế gaming" }
];

console.log("🚀 Bắt đầu quá trình CRAWL TỰ ĐỘNG HÀNG LOẠT...");
console.log(`📦 Tổng cộng có ${jobs.length} danh mục cần thu thập.\n`);

const scriptPath = path.join(__dirname, 'crawlGearVN.js');

for (let i = 0; i < jobs.length; i++) {
  const job = jobs[i];
  console.log(`\n======================================================`);
  console.log(`[${i + 1}/${jobs.length}] ⏳ Đang xử lý: ${job.category}`);
  console.log(`URL: ${job.url}`);
  console.log(`======================================================\n`);

  try {
    // Gọi lại script crawlGearVN.js cho từng danh mục
    // Việc này giúp tránh rò rỉ bộ nhớ Puppeteer (chạy xong 1 mục là giải phóng RAM)
    execSync(`node "${scriptPath}" "${job.url}" "${job.keyword}" "${job.category}" "15"`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Có lỗi xảy ra khi crawl mục ${job.category}. Bỏ qua và chạy mục tiếp theo...\n`);
  }
}

console.log("\n🎉 HOÀN TẤT QUÁ TRÌNH CRAWL TẤT CẢ DANH MỤC!");

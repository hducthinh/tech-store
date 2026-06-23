import puppeteer from 'puppeteer';
import slugify from 'slugify';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Load biến môi trường
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import Models
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import Brand from '../models/brand.model.js';
import dns from 'dns';

// Cấu hình DNS mặc định cho Node.js tránh lỗi ECONNREFUSED khi phân giải MongoDB SRV
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Không thể cấu hình DNS Google:", e.message);
}

const targetUrl = process.argv[2] || "https://gearvn.com/collections/man-hinh";
const requiredKeyword = process.argv[3] || (targetUrl.includes("man-hinh") ? "màn hình" : null);
const forcedCategory = process.argv[4] || null;
const maxItems = parseInt(process.argv[5], 10) || null;

// Helper để tạo slug chuẩn
const createSlug = (text) => {
  return slugify(text, { lower: true, strict: true, locale: 'vi' });
};

// Helper để parse giá
const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
};

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI chưa được cấu hình trong .env");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("✅ Kết nối MongoDB thành công.");
}

async function runCrawler() {
  await connectDB();

  let browser;
  const stats = {
    total: 0,
    inserted: 0,
    updated: 0,
    failed: 0
  };

  try {
    console.log("🚀 Khởi động Puppeteer...");
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`📡 Đang thu thập link sản phẩm từ: ${targetUrl}`);
    let productLinks = new Set();
    let currentPage = 1;
    let hasNextPage = true;

    // Crawl Pagination
    while (hasNextPage) {
      const separator = targetUrl.includes('?') ? '&' : '?';
      const pageUrl = `${targetUrl}${separator}page=${currentPage}`;
      console.log(`   ⏳ Đang đọc trang ${currentPage}: ${pageUrl}`);
      
      const response = await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
      if (!response) break;
      
      await delay(1500); // Chờ JS render nhẹ

      // Lấy link sản phẩm (GearVN / Haravan selectors)
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors
          .map(a => a.href)
          .filter(href => href.includes('/products/'))
          .filter(href => !href.includes('#') && !href.includes('?'));
      });

      if (links.length === 0) {
        hasNextPage = false;
        console.log(`   ℹ️ Không tìm thấy thêm sản phẩm ở trang ${currentPage}. Chuyển sang cào chi tiết.`);
      } else {
        const initialSize = productLinks.size;
        links.forEach(link => productLinks.add(link));
        
        // Nếu số lượng link không đổi tức là đã lặp lại trang cuối
        if (productLinks.size === initialSize) {
          hasNextPage = false;
        } else {
          currentPage++;
        }
      }
      
      // Giới hạn demo khoảng 3 trang để tránh block
      if (currentPage > 3 && productLinks.size > 20) {
          hasNextPage = false; 
      }
      
      // Dừng sớm nếu thu thập dư số lượng để dự phòng rác (tăng buffer lên 15)
      if (maxItems && productLinks.size >= maxItems + 15) {
          hasNextPage = false;
      }
    }

    let linksArray = Array.from(productLinks);
    stats.total = linksArray.length;
    console.log(`\n🎯 Đã tìm thấy tổng cộng ${stats.total} sản phẩm. Bắt đầu thu thập chi tiết...\n`);

    // Crawl chi tiết từng sản phẩm
    for (let i = 0; i < linksArray.length; i++) {
      const productUrl = linksArray[i];
      let retries = 0;
      let success = false;

      while (retries < 3 && !success) {
        try {
          await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await delay(2000); // Đợi render

          const productData = await page.evaluate(() => {
            // Lấy Name
            const nameEl = document.querySelector('h1.product-title') || document.querySelector('h1');
            const name = nameEl ? nameEl.innerText.trim() : null;

            // Lấy Price
            const priceEl = document.querySelector('.product-price') || document.querySelector('.price');
            const originalPriceEl = document.querySelector('.product-price-old') || document.querySelector('.old-price') || document.querySelector('del');
            
            // Xử lý giá bị nối chuỗi (VD: "2.090.000₫ 2.490.000₫")
            let priceText = "0";
            if (priceEl) {
               // Tìm chuỗi số đầu tiên có dạng tiền tệ
               const match = priceEl.innerText.match(/[\d.,]+/);
               priceText = match ? match[0] : "0";
            }
            
            let originalPriceText = priceText;
            if (originalPriceEl) {
               const match = originalPriceEl.innerText.match(/[\d.,]+/);
               originalPriceText = match ? match[0] : priceText;
            }

            // Lấy ảnh
            const imgEls = document.querySelectorAll('.product-gallery img, .product-slider img, .thumb-img img');
            let images = Array.from(imgEls).map(img => img.src).filter(src => src && !src.includes('data:image'));
            if (images.length === 0) {
              const mainImg = document.querySelector('.product-image img');
              if (mainImg && mainImg.src) images.push(mainImg.src);
            }

            // Specs
            let specs = {};
            // Trường hợp 1: Specs dạng bảng (Table)
            const specRows = document.querySelectorAll('table tr');
            specRows.forEach(row => {
              const tds = row.querySelectorAll('td, th');
              if (tds.length >= 2) {
                const key = tds[0].innerText.trim().replace(/:$/, '');
                const value = tds[1].innerText.trim();
                if (key && value) specs[key] = value;
              }
            });
            // Trường hợp 2: Specs dạng list có dấu hai chấm
            const listRows = document.querySelectorAll('.product-desc ul li, .product-summary ul li');
            listRows.forEach(row => {
              const text = row.innerText.trim();
              if (text.includes(':')) {
                const parts = text.split(':');
                if (parts.length >= 2) {
                   const key = parts[0].trim();
                   const value = parts.slice(1).join(':').trim();
                   if (!specs[key]) specs[key] = value;
                }
              }
            });

            // Lọc bỏ key chứa ký tự đặc biệt làm lỗi Mongoose Map
            let cleanSpecs = {};
            Object.keys(specs).forEach(k => {
               const cleanKey = k.replace(/\./g, '').replace(/^\$/, ''); // Mongoose cấm key chứa '.' hoặc bắt đầu bằng '$'
               cleanSpecs[cleanKey] = specs[k];
            });

            // Breadcrumb cho Category
            const breadcrumbEls = document.querySelectorAll('.breadcrumb li a, .breadcrumbs li a');
            let categoryName = 'GearVN Product';
            if (breadcrumbEls.length >= 2) {
               categoryName = breadcrumbEls[breadcrumbEls.length - 1].innerText.trim();
               if (categoryName.toLowerCase().includes('trang chủ')) categoryName = 'GearVN Product';
            }

            // SKU
            const skuEl = document.querySelector('.product-sku') || document.querySelector('[data-sku]');
            let sku = skuEl ? skuEl.innerText.trim().replace('SKU:', '').trim() : null;
            if(!sku) sku = null;

            return {
              name,
              priceText,
              originalPriceText,
              images,
              specs: cleanSpecs,
              categoryName,
              sku,
              stock: 100 // Default nếu không thấy
            };
          });

          if (!productData || !productData.name) {
            throw new Error("Không lấy được tên sản phẩm");
          }

          if (requiredKeyword && !productData.name.toLowerCase().includes(requiredKeyword.toLowerCase())) {
             console.log(`[${i + 1}/${stats.total}] ⏭️  Bỏ qua ${productData.name} (không chứa từ khóa "${requiredKeyword}")`);
             success = true;
             break;
          }

          // Xử lý và Map Data
          if (forcedCategory) {
             productData.categoryName = forcedCategory;
          }

          productData.price = parsePrice(productData.priceText);
          productData.originalPrice = parsePrice(productData.originalPriceText) || productData.price;
          
          // Lọc tối đa 5 ảnh
          productData.images = [...new Set(productData.images)].slice(0, 5);
          productData.thumbnail = productData.images.length > 0 ? productData.images[0] : "";
          
          productData.slug = createSlug(productData.name);

          // Brand detection
          let brandName = 'Khác';
          if (productData.specs['Hãng sản xuất']) brandName = productData.specs['Hãng sản xuất'];
          else if (productData.specs['Thương hiệu']) brandName = productData.specs['Thương hiệu'];
          else if (productData.specs['Hãng']) brandName = productData.specs['Hãng'];
          
          if (brandName === 'Khác' && productData.name) {
             const knownBrands = [
               'Acer', 'Apple', 'ASUS', 'Dell', 'Gigabyte', 'HP', 'Lenovo', 'LG', 'MSI', 'Microsoft', 'Razer',
               'AOC', 'BenQ', 'Cooler Master', 'Corsair', 'Philips', 'Samsung', 'ViewSonic',
               'Attack Shark', 'DareU', 'Fuhlen', 'Glorious', 'HyperX', 'Lamzu', 'Logitech', 'Pulsar', 'Rapoo', 'SteelSeries', 'VGN', 'Xtrfy', 'Zowie',
               'Akko', 'Aula', 'Ducky', 'FL-Esports', 'IQUNIX', 'Keychron', 'Royal Kludge', 'RK',
               'Audio-Technica', 'Sony',
               'AMD', 'ASRock', 'Colorful', 'Crucial', 'G.Skill', 'Intel', 'Kingston', 'Lexar', 'NZXT', 'Patriot', 'Seagate', 'TeamGroup', 'Thermaltake', 'WD', 'Western Digital',
               'Antec', 'DeepCool', 'Lian Li', 'Montech',
               'Anda Seat', 'Cougar', 'DXRacer', 'E-Dra', 'Warrior',
               '8BitDo', 'Nintendo', 'PlayStation'
             ];
             const foundBrand = knownBrands.find(b => {
                const regex = new RegExp(`\\b${b}\\b`, 'i');
                return regex.test(productData.name.replace(/-/g, ' '));
             });
             if (foundBrand) brandName = foundBrand;
          }

          // 1. UPSERT Category
          const categorySlug = createSlug(productData.categoryName);
          let category = await Category.findOne({ slug: categorySlug });
          if (!category) {
            category = await Category.create({ name: productData.categoryName, slug: categorySlug });
          }

          // 2. UPSERT Brand
          const brandSlug = createSlug(brandName);
          let brand = await Brand.findOne({ slug: brandSlug });
          if (!brand) {
            brand = await Brand.create({ name: brandName, slug: brandSlug });
          }

          // 3. UPSERT Product
          const existingProduct = await Product.findOne({
            $or: [
              ...(productData.sku ? [{ sku: productData.sku }] : []),
              { slug: productData.slug }
            ]
          });

          if (existingProduct) {
            // Update
            existingProduct.price = productData.price;
            existingProduct.originalPrice = productData.originalPrice;
            existingProduct.stock = productData.stock;
            existingProduct.thumbnail = productData.thumbnail;
            existingProduct.images = productData.images;
            existingProduct.specs = productData.specs; // Cập nhật lại thông số kỹ thuật nếu crawl lại
            existingProduct.brandId = brand._id;
            existingProduct.brandName = brand.name;
            existingProduct.categoryId = category._id;
            existingProduct.categoryName = category.name;
            await existingProduct.save();
            stats.updated++;
            console.log(`[${i + 1}/${stats.total}] ${productData.name} - Update`);
          } else {
            // Insert
            await Product.create({
              name: productData.name,
              slug: productData.slug,
              sku: productData.sku,
              categoryId: category._id,
              categoryName: category.name,
              brandId: brand._id,
              brandName: brand.name,
              price: productData.price,
              originalPrice: productData.originalPrice,
              stock: productData.stock,
              thumbnail: productData.thumbnail,
              images: productData.images,
              specs: productData.specs,
              description: "Sản phẩm được lấy tự động từ hệ thống",
              shortDescription: productData.name
            });
            stats.inserted++;
            console.log(`[${i + 1}/${stats.total}] ${productData.name} - Insert`);
          }

          success = true;
          
          if (maxItems && (stats.inserted + stats.updated) >= maxItems) {
             console.log(`\n🎉 Đã đạt đủ số lượng ${maxItems} sản phẩm hợp lệ.`);
             i = linksArray.length; // Ép vòng lặp for bên ngoài kết thúc
             break;
          }
        } catch (error) {
          retries++;
          if (retries >= 3) {
            stats.failed++;
            console.log(`[${i + 1}/${stats.total}] (Link ${i}) - Failed: ${error.message}`);
          } else {
             await delay(2000); // Wait before retry
          }
        }
      }
    }

  } catch (error) {
    console.error("❌ Lỗi nghiêm trọng trong quá trình Crawler:", error);
  } finally {
    // Kết thúc
    if (browser) {
      await browser.close();
      console.log("\n🔒 Đã đóng Puppeteer.");
    }
    await mongoose.disconnect();
    console.log("🔒 Đã ngắt kết nối MongoDB.");

    console.log(`\n========================`);
    console.log(`Total Products : ${stats.total}`);
    console.log(`Inserted       : ${stats.inserted}`);
    console.log(`Updated        : ${stats.updated}`);
    console.log(`Failed         : ${stats.failed}`);
    console.log(`========================\n`);
  }
}

runCrawler();

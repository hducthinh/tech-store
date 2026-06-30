const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const cloudinary = require('cloudinary').v2;


//node crawler_puppeteer.js "https://gearvn.com/collections/vga" "VGA" "GIGABYTE" 30
//node crawler_puppeteer.js <URL_Danh_Mục> <Tên_Danh_Mục_Sẽ_Lưu> <Tên_Thương_Hiệu> <Số_Lượng_Sản_Phẩm_Tối_Đa>

// ==========================================
// 🛠 CẤU HÌNH NHANH (SỬA TRỰC TIẾP Ở ĐÂY CHO NHANH)
// ==========================================
const CONFIG = {
    url: "https://gearvn.com/search?q=gi%C3%A1%20treo%20m%C3%A0n%20h%C3%ACnh",
    category: "ARM",
    brand: "WARRIOR",
    maxItems: 10
};
// ==========================================

// Load .env từ thư mục server
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Hàm tạo slug
function generateSlug(text) {
    return text.toString().toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
        .replace(/[^a-z0-9 -]/g, '') // Chỉ giữ lại chữ, số, khoảng trắng và gạch ngang
        .replace(/\s+/g, '-')        // Thay khoảng trắng bằng gạch ngang
        .replace(/-+/g, '-');        // Xóa gạch ngang thừa
}

async function scrapeGearVNWithPuppeteer(collectionUrl, categoryName = "Loa vi tính", brandName = "GearVN", maxItems = 20) {
    const results = [];
    console.log(`🔍 Đang mở danh mục: ${collectionUrl}`);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    await page.goto(collectionUrl, { waitUntil: 'networkidle2' });

    // Đợi một chút cho React/Vue render xong
    await new Promise(r => setTimeout(r, 2000));

    // Cuộn trang xuống để load các sản phẩm (Lazy load)
    for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await new Promise(r => setTimeout(r, 1000));
    }

    // Lấy link sản phẩm
    let productLinks = await page.evaluate(() => {
        const elements = document.querySelectorAll(".proloop-block a[href*='/products/'], .proloop-detail a[href*='/products/'], .product-row a[href*='/products/']");
        const links = [];
        elements.forEach(el => {
            let href = el.getAttribute("href");
            if (href && !href.includes("?")) {
                if (!href.startsWith("http")) href = "https://gearvn.com" + href;
                links.push(href);
            }
        });
        return [...new Set(links)]; // Lọc trùng
    });

    console.log(`✅ Đã tìm thấy ${productLinks.length} sản phẩm để cào!`);

    for (let i = 0; i < Math.min(productLinks.length, maxItems); i++) {
        const url = productLinks[i];
        console.log(`[${i + 1}/${Math.min(productLinks.length, maxItems)}] Đang cào bằng Puppeteer: ${url}`);

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Bóc tách thông tin sản phẩm
            const productDataRaw = await page.evaluate(() => {
                const nameEl = document.querySelector("h1.product-title, h1");
                const name = nameEl ? nameEl.innerText.trim() : "Unknown Product";

                // Bóc tách giá sản phẩm
                let priceText = "0";
                const priceElements = document.querySelectorAll(".pro-price, .product-price");
                for (let el of priceElements) {
                    if (el.offsetParent !== null) { // is_visible
                        const text = el.innerText.trim();
                        if (text.includes("₫") || text.toLowerCase().includes("đ")) {
                            priceText = text.split('\n')[0];
                            break;
                        }
                    }
                }

                let originalPriceText = priceText;
                const oldPriceElements = document.querySelectorAll(".pro-price-del, .product-price-old, del");
                for (let el of oldPriceElements) {
                    if (el.offsetParent !== null) {
                        const text = el.innerText.trim();
                        if (text.includes("₫") || text.toLowerCase().includes("đ")) {
                            originalPriceText = text;
                            break;
                        }
                    }
                }

                // Bóc tách hình ảnh
                const imgElements = document.querySelectorAll(".product-gallery__thumb img, .product-gallery img, .product-image img, .gallery-top img");
                let rawImages = [];
                for (let img of imgElements) {
                    let src = img.getAttribute("src");
                    if (src) {
                        if (src.startsWith("//")) src = "https:" + src;
                        src = src.replace("_thumb", "").replace("_compact", "");
                        rawImages.push(src);
                    }
                }
                rawImages = [...new Set(rawImages)].slice(0, 4);

                // Bóc tách cấu hình (Thông số kỹ thuật bảng bên phải)
                const specs = {};
                const specRows = document.querySelectorAll("#gvn-specs-core-table tr");
                for (let row of specRows) {
                    const cols = row.querySelectorAll("td, th");
                    if (cols.length >= 2) {
                        const key = cols[0].innerText.trim();
                        const val = cols[1].innerText.trim();
                        if (key && val) {
                            specs[key] = val;
                        }
                    }
                }

                // Bóc tách mô tả ngắn theo đúng yêu cầu
                let shortDescription = `${name} chính hãng tại Đức Thịnh TechShop.`;

                // Bóc tách mô tả dài giống hệt mô tả ngắn theo yêu cầu
                let description = `<p>${shortDescription}</p>`;

                return { name, priceText, originalPriceText, rawImages, specs, shortDescription, description };
            });

            // Clean price
            function cleanPrice(text) {
                const match = text.match(/[\d\.,]+/);
                if (match) {
                    const nums = match[0].replace(/[^\d]/g, '');
                    return nums ? parseInt(nums, 10) : 0;
                }
                return 0;
            }

            let price = cleanPrice(productDataRaw.priceText);
            let originalPrice = cleanPrice(productDataRaw.originalPriceText);
            if (originalPrice === 0) originalPrice = price;

            let images = productDataRaw.rawImages;

            const productSlug = generateSlug(productDataRaw.name);

            console.log(`    -> Đang upload ${images.length} ảnh lên Cloudinary...`);
            let cloudinaryImages = [];
            for (let idx = 0; idx < images.length; idx++) {
                let imgUrl = images[idx];
                try {
                    const uploadResult = await cloudinary.uploader.upload(imgUrl, {
                        folder: `tech-store-products/${categoryName.toUpperCase()}/${brandName.toUpperCase()}`,
                        public_id: `${productSlug}-${idx + 1}`,
                        overwrite: true
                    });
                    cloudinaryImages.push(uploadResult.secure_url);
                } catch (e) {
                    console.log(`      ⚠️ Lỗi upload ảnh ${imgUrl}:`, e.message);
                    cloudinaryImages.push(imgUrl); // Fallback to raw URL
                }
            }

            const productData = {
                name: productDataRaw.name,
                slug: productSlug,
                sku: `SKU-${Math.floor(Math.random() * 900000) + 100000}`,
                categoryName: categoryName,
                brandName: brandName,
                price: price,
                originalPrice: originalPrice,
                stock: Math.floor(Math.random() * 90) + 10,
                specs: productDataRaw.specs,
                images: cloudinaryImages,
                description: productDataRaw.description || "Sản phẩm chính hãng tại Đức Thịnh TechShop.",
                shortDescription: productDataRaw.shortDescription,
                warrantyMonths: 12,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            results.push(productData);
            console.log(`      => Đã lấy thông tin: ${productData.name} - ${productDataRaw.priceText}`);

        } catch (error) {
            console.log(`      ⚠️ Lỗi khi cào ${url}:`, error.message);
        }
    }

    await browser.close();
    return results;
}

async function saveToMongoDB(products, categoryName, brandName) {
    let mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.log("⚠️ Không tìm thấy biến môi trường MONGO_URI. Dùng mặc định local mongodb://127.0.0.1:27017/tech-store");
        mongoUri = "mongodb://127.0.0.1:27017/tech-store";
    }

    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const dbName = mongoUri.split('/').pop().split('?')[0] || "tech-store";
        const db = client.db(dbName);
        console.log(`\n🔌 Đang kết nối tới DB: ${dbName}`);

        // 1. Upsert Category
        const catSlug = generateSlug(categoryName);
        const categoryResult = await db.collection("categories").findOneAndUpdate(
            { slug: catSlug },
            { $set: { name: categoryName, slug: catSlug, isActive: true } },
            { upsert: true, returnDocument: 'after' }
        );
        const category = categoryResult;

        // 2. Upsert Brand
        const brandSlug = generateSlug(brandName);
        const brandResult = await db.collection("brands").findOneAndUpdate(
            { slug: brandSlug },
            { $set: { name: brandName, slug: brandSlug, isActive: true } },
            { upsert: true, returnDocument: 'after' }
        );
        const brand = brandResult;

        // 3. Upsert Products
        let inserted = 0;
        for (let p of products) {
            p.categoryId = category._id;
            p.categoryName = category.name;
            p.brandId = brand._id;
            p.brandName = brand.name;

            await db.collection("products").updateOne(
                { slug: p.slug },
                { $set: p },
                { upsert: true }
            );
            inserted++;
        }

        console.log(`✅ Đã thêm/cập nhật ${inserted} sản phẩm vào MongoDB thành công!`);
    } catch (e) {
        console.error("❌ Lỗi khi lưu vào DB:", e);
    } finally {
        await client.close();
    }
}

async function main() {
    let collectionUrl = CONFIG.url;
    let categoryName = CONFIG.category;
    let brandName = CONFIG.brand;
    let maxProducts = CONFIG.maxItems;

    const args = process.argv.slice(2);
    if (args.length > 0) collectionUrl = args[0];
    if (args.length > 1) categoryName = args[1];
    if (args.length > 2) brandName = args[2];
    if (args.length > 3) {
        const parsed = parseInt(args[3], 10);
        if (!isNaN(parsed)) maxProducts = parsed;
    }

    console.log(`👉 Bắt đầu cào dữ liệu:`);
    console.log(` - URL: ${collectionUrl}`);
    console.log(` - Category: ${categoryName}`);
    console.log(` - Brand: ${brandName}`);
    console.log(` - Max items: ${maxProducts}`);

    const data = await scrapeGearVNWithPuppeteer(collectionUrl, categoryName, brandName, maxProducts);

    fs.writeFileSync("products_data_puppeteer.json", JSON.stringify(data, null, 2), "utf-8");
    console.log(`\n🎉 XONG! Đã lưu ${data.length} sản phẩm vào products_data_puppeteer.json`);

    if (data.length > 0) {
        await saveToMongoDB(data, categoryName, brandName);
    } else {
        console.log("\n⚠️ Không cào được sản phẩm nào.");
    }
}

main().catch(console.error);

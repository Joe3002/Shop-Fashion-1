import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import productModel from './models/productModel.js';
import connectDB from './config/mongodb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// --- CẤU HÌNH ---
const PRODUCTS_TO_CREATE = 60; // Số lượng sản phẩm muốn tạo thêm
// --- KẾT THÚC CẤU HÌNH ---

const seedProducts = async () => {
    try {
        console.log('Bắt đầu tạo dữ liệu sản phẩm mẫu (Váy & Áo len)...');
        await connectDB();

        const categories = ['Men', 'Women', 'Kids'];
        // const subCategories = ['Topwear', 'Bottomwear', 'Winterwear'];
        const sizesList = ['S', 'M', 'L', 'XL', 'XXL'];
        
        // Một số link ảnh mẫu thời trang từ Unsplash để dữ liệu trông đẹp hơn
        const sampleImages = [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
            "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=500&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80",
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80",
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80",
            "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&q=80",
            "https://images.unsplash.com/photo-1551488852-0801751acbe3?w=500&q=80"
        ];

        const newProducts = [];

        for (let i = 0; i < PRODUCTS_TO_CREATE; i++) {
            let category, subCategory, typeName;
            const rand = Math.random();
            
            // Logic mới: 40% Áo len, 30% Váy liền, 30% Chân váy
            if (rand < 0.4) {
                // 40% là Áo len (Winterwear) cho mọi đối tượng
                category = categories[Math.floor(Math.random() * categories.length)];
                subCategory = 'Winterwear';
                typeName = 'Áo len';
            } else if (rand < 0.7) {
                // 30% là Váy liền (Women - Topwear)
                category = 'Women';
                subCategory = 'Topwear'; 
                typeName = 'Váy liền';
            } else {
                // 30% là Chân váy (Women - Bottomwear)
                category = 'Women';
                subCategory = 'Bottomwear';
                typeName = 'Chân váy';
            }
            
            const adjectives = ['Cotton', 'Cao cấp', 'Thoáng mát', 'Dệt kim', 'Vintage', 'Hiện đại', 'Len lông cừu', 'Họa tiết', 'Dáng suông', 'Body', 'Xếp ly', 'Hàn Quốc'];
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            
            const name = `${typeName} ${category} ${adj} Mẫu ${Math.floor(Math.random() * 1000)}`;

            // Chọn ngẫu nhiên 3-4 ảnh cho mỗi sản phẩm
            const productImages = [];
            const numImgs = Math.floor(Math.random() * 2) + 3; 
            for (let j = 0; j < numImgs; j++) {
                productImages.push(sampleImages[Math.floor(Math.random() * sampleImages.length)]);
            }

            // Chọn ngẫu nhiên sizes
            const productSizes = sizesList.filter(() => Math.random() > 0.3);
            if (productSizes.length === 0) productSizes.push('M', 'L');

            const product = {
                name: name,
                description: `Mô tả chi tiết cho sản phẩm ${name}. Thiết kế thời trang, chất liệu ${typeName.includes('len') ? 'len ấm áp' : 'vải mềm mại'}, phù hợp cho mùa ${typeName.includes('len') ? 'đông' : 'hè/thu'}.`,
                price: (Math.floor(Math.random() * 20) + 10) * 20000, // Giá từ 200k đến 600k
                image: productImages,
                category: category,
                subCategory: subCategory,
                sizes: productSizes,
                bestseller: Math.random() < 0.3, // 30% cơ hội là bestseller
                date: Date.now() - Math.floor(Math.random() * 10000000000) // Ngày ngẫu nhiên trong quá khứ
            };

            newProducts.push(product);
        }

        // --- THÊM LOG THỐNG KÊ ĐỂ DỄ KIỂM TRA ---
        const stats = {
            'Topwear (Váy liền/Áo)': 0,
            'Bottomwear (Chân váy/Quần)': 0,
            'Winterwear (Áo len/Khoác)': 0
        };
        newProducts.forEach(p => {
            if (p.subCategory === 'Topwear') stats['Topwear (Váy liền/Áo)']++;
            else if (p.subCategory === 'Bottomwear') stats['Bottomwear (Chân váy/Quần)']++;
            else if (p.subCategory === 'Winterwear') stats['Winterwear (Áo len/Khoác)']++;
        });
        console.log('📊 Thống kê sản phẩm vừa tạo:', stats);
        // -----------------------------------------

        await productModel.insertMany(newProducts);
        console.log(`\x1b[32m%s\x1b[0m`, `✅ Đã thêm thành công ${newProducts.length} sản phẩm mới vào cơ sở dữ liệu.`);

    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Lỗi:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Đã ngắt kết nối MongoDB.');
    }
};

seedProducts();
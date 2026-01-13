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
const PRODUCTS_TO_CREATE = 50; // Số lượng sản phẩm muốn tạo thêm
// --- KẾT THÚC CẤU HÌNH ---

const seedProducts = async () => {
    try {
        console.log('Bắt đầu tạo dữ liệu sản phẩm mẫu...');
        await connectDB();

        const categories = ['Men', 'Women', 'Kids'];
        const subCategories = ['Topwear', 'Bottomwear', 'Winterwear'];
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
            const category = categories[Math.floor(Math.random() * categories.length)];
            const subCategory = subCategories[Math.floor(Math.random() * subCategories.length)];
            
            // Tạo tên sản phẩm ngẫu nhiên
            let typeName = 'Áo';
            if (subCategory === 'Bottomwear') typeName = 'Quần';
            if (subCategory === 'Winterwear') typeName = 'Áo khoác';
            
            const adjectives = ['Cotton', 'Cao cấp', 'Thoáng mát', 'Thể thao', 'Vintage', 'Hiện đại', 'Basic', 'Họa tiết'];
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
                description: `Mô tả chi tiết cho sản phẩm ${name}. Chất liệu vải cao cấp, đường may tinh tế, phù hợp với nhiều phong cách thời trang hiện nay.`,
                price: (Math.floor(Math.random() * 20) + 5) * 20000, // Giá từ 100k đến 500k
                image: productImages,
                category: category,
                subCategory: subCategory,
                sizes: productSizes,
                bestseller: Math.random() < 0.2, // 20% cơ hội là bestseller
                date: Date.now() - Math.floor(Math.random() * 10000000000) // Ngày ngẫu nhiên trong quá khứ
            };

            newProducts.push(product);
        }

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
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
import connectDB from './config/mongodb.js';
import orderModel from './models/orderModel.js';
import userModel from './models/userModel.js';
import productModel from './models/productModel.js';

// --- CẤU HÌNH ---
// Thay đổi số lượng đơn hàng bạn muốn tạo tại đây
const ORDERS_TO_CREATE = 500;
// --- KẾT THÚC CẤU HÌNH ---

const seedOrders = async () => {
    try {
        console.log('Bắt đầu quá trình tạo dữ liệu đơn hàng mẫu...');

        // Kết nối CSDL
        await connectDB();
        console.log('Đã kết nối tới MongoDB.');

        // 1. Lấy danh sách người dùng và sản phẩm hiện có
        const users = await userModel.find({});
        const allProducts = await productModel.find({});

        if (users.length === 0 || allProducts.length === 0) {
            console.error("\x1b[31m%s\x1b[0m", "Lỗi: Cần có ít nhất một người dùng và một sản phẩm trong cơ sở dữ liệu để tạo đơn hàng.");
            return;
        }

        // --- LOGIC MỚI: GIẢ LẬP SẢN PHẨM KHÔNG BÁN ĐƯỢC ---
        // Chỉ lấy ngẫu nhiên khoảng 70% sản phẩm để tạo đơn hàng, 30% còn lại sẽ không được chọn trong đợt này
        const productsToSellCount = Math.max(1, Math.floor(allProducts.length * 0.7));
        const products = allProducts.sort(() => 0.5 - Math.random()).slice(0, productsToSellCount);

        console.log(`Tìm thấy ${users.length} người dùng và ${allProducts.length} sản phẩm.`);
        console.log(`Đang tạo đơn hàng từ ${products.length} sản phẩm (để lại ${allProducts.length - products.length} sản phẩm không bán trong đợt này).`);

        const newOrders = [];
        const statuses = ['Đã đặt hàng', 'Đang giao hàng', 'Đã giao hàng'];
        const paymentMethods = ['Thanh toán khi nhận hàng', 'QR'];

        // Dữ liệu mẫu để tạo tên và địa chỉ ngẫu nhiên
        const hoList = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
        const tenDemList = ['Văn', 'Thị', 'Đức', 'Thành', 'Minh', 'Hữu', 'Mỹ', 'Ngọc', 'Quang', 'Thanh', 'Hoài', 'Thu', 'Gia', 'Khánh'];
        const tenList = ['An', 'Bình', 'Cường', 'Dũng', 'Giang', 'Hải', 'Hùng', 'Huy', 'Khánh', 'Lan', 'Linh', 'Mai', 'Minh', 'Nam', 'Nga', 'Phúc', 'Quân', 'Quang', 'Sơn', 'Thảo', 'Thịnh', 'Trang', 'Tùng', 'Việt', 'Yến', 'Tâm', 'Thư', 'Hạnh'];
        const cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Vũng Tàu', 'Huế', 'Đà Lạt', 'Buôn Ma Thuột', 'Bình Dương', 'Đồng Nai', 'Quảng Ninh', 'Thanh Hóa', 'Nghệ An'];
        const streets = ['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lý Thường Kiệt', 'Điện Biên Phủ', 'Nguyễn Trãi', 'Phạm Văn Đồng', 'Võ Văn Kiệt', 'Trường Chinh', 'Giải Phóng', 'Cầu Giấy', 'Xuân Thủy', 'Láng Hạ', 'Kim Mã', 'Đội Cấn'];

        // Khoảng thời gian: từ 1/10 năm ngoái đến hiện tại
        const endDate = new Date();
        const startDate = new Date(endDate.getFullYear() - 1, 9, 1); // Tháng 10 (vì tháng trong JS bắt đầu từ 0)
        
        console.log(`Đang tạo ${ORDERS_TO_CREATE} đơn hàng (bao gồm dữ liệu hôm nay/tháng này để test biểu đồ)...`);

        for (let i = 0; i < ORDERS_TO_CREATE; i++) {
            // 2. Chọn người dùng ngẫu nhiên
            const randomUser = users[Math.floor(Math.random() * users.length)];

            // 3. Tạo các sản phẩm trong đơn hàng một cách ngẫu nhiên
            const numItems = Math.floor(Math.random() * 4) + 1; // 1 đến 4 sản phẩm mỗi đơn
            let orderItems = [];
            let totalAmount = 0;

            for (let j = 0; j < numItems; j++) {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                if (!randomProduct || !randomProduct.sizes || randomProduct.sizes.length === 0) continue;

                const quantity = Math.floor(Math.random() * 2) + 1; // số lượng từ 1 đến 2
                // Lấy size từ object size ngẫu nhiên
                const sizeInfo = randomProduct.sizes[Math.floor(Math.random() * randomProduct.sizes.length)];
                
                orderItems.push({
                    ...randomProduct.toObject(),
                    quantity,
                    size: sizeInfo.size // Chỉ lấy tên size
                });
                totalAmount += randomProduct.price * quantity;
            }

            if (orderItems.length === 0) continue; // Bỏ qua nếu không tạo được item nào

            // 4. Tạo các dữ liệu ngẫu nhiên khác cho đơn hàng
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const randomPaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
            
            // --- CẬP NHẬT: Logic chọn ngày để đảm bảo có dữ liệu cho biểu đồ ---
            let randomDate;
            const now = new Date();
            if (i < 15) {
                // 15 đơn đầu tiên luôn là HÔM NAY
                const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                randomDate = new Date(startToday.getTime() + Math.random() * (now.getTime() - startToday.getTime()));
            } else if (i < 40) {
                // 25 đơn tiếp theo là THÁNG NÀY
                const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                randomDate = new Date(startMonth.getTime() + Math.random() * (now.getTime() - startMonth.getTime()));
            } else {
                // Còn lại random trong năm qua
                randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
            }
            // ------------------------------------------------------------------

            // Tạo thông tin người nhận ngẫu nhiên
            const rHo = hoList[Math.floor(Math.random() * hoList.length)];
            const rTenDem = tenDemList[Math.floor(Math.random() * tenDemList.length)];
            const rTen = tenList[Math.floor(Math.random() * tenList.length)];
            const rFullname = `${rHo} ${rTenDem} ${rTen}`;
            const rCity = cities[Math.floor(Math.random() * cities.length)];
            const rStreet = `${Math.floor(Math.random() * 500) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`;
            const rPhone = `0${Math.floor(Math.random() * 9 + 1)}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;

            const newOrder = new orderModel({
                userId: randomUser._id,
                items: orderItems,
                amount: totalAmount + 20000, // Thêm phí ship
                address: { fullname: rFullname, email: randomUser.email, street: rStreet, city: rCity, phone: rPhone },
                status: randomStatus,
                paymentMethod: randomPaymentMethod,
                payment: randomStatus === 'Đã giao hàng' || (randomPaymentMethod !== 'Thanh toán khi nhận hàng' && Math.random() > 0.2),
                date: randomDate.getTime(),
            });
            newOrders.push(newOrder);
        }

        if (newOrders.length > 0) await orderModel.insertMany(newOrders);
        console.log(`\x1b[32m%s\x1b[0m`, `✅ Hoàn thành! Đã tạo thành công ${newOrders.length} đơn hàng mẫu.`);

    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Đã xảy ra lỗi trong quá trình tạo dữ liệu:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Đã ngắt kết nối MongoDB.');
    }
};

seedOrders();
import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'
import productModel from '../models/productModel.js';
import ExcelJS from 'exceljs';

const placeOrder = async (req, res) => {
    console.log('placeOrder controller chạy, req.body:', req.body);
    try {
        // Lấy paymentMethod từ body, nếu không có thì mặc định là COD
        const { userId, items, amount, address, paymentMethod = "Thanh toán khi nhận hàng" } = req.body;
        
        // Kiểm tra đầu vào cơ bản
        if (!userId) {
            return res.status(400).json({ success: false, message: "Thiếu userId!" });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Giỏ hàng trống!" });
        }

        // Yêu cầu mới: Kiểm tra thông tin giao hàng
        // Bất kể phương thức thanh toán là gì, đều cần thông tin giao hàng.
        if (!address || !address.fullname || !address.street || !address.city || !address.phone) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin giao hàng (họ tên, địa chỉ, thành phố, số điện thoại)." });
        }

        // --- BƯỚC 1: KIỂM TRA TỒN KHO TRƯỚC KHI TẠO ĐƠN ---
        for (const item of items) {
            const product = await productModel.findById(item._id);
            if (!product) {
                return res.status(400).json({ success: false, message: `Sản phẩm "${item.name}" không tồn tại.` });
            }

            const sizeInfo = product.sizes.find(s => s.size === item.size);
            if (!sizeInfo) {
                return res.status(400).json({ success: false, message: `Size "${item.size}" không hợp lệ cho sản phẩm "${item.name}".` });
            }

            if (sizeInfo.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Sản phẩm "${item.name}" (Size: ${item.size}) không đủ số lượng. Chỉ còn ${sizeInfo.stock} sản phẩm.` 
                });
            }
        }

        let paymentStatus = false;
        let orderStatus = "Đã đặt hàng"; // Mặc định cho COD

        // Xử lý cho các phương thức thanh toán khác nhau
        if (paymentMethod === "QR") {
            // Với QR, người dùng bấm "Đã thanh toán", nên ta ghi nhận thanh toán
            // và chuyển trạng thái chờ admin xác nhận.
            paymentStatus = true;
            orderStatus = "Chờ xác nhận"; // Trạng thái mới để admin kiểm tra
        } else if (paymentMethod !== "Thanh toán khi nhận hàng") {
            return res.status(400).json({ success: false, message: "Phương thức thanh toán không hợp lệ." });
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: paymentMethod,
            payment: paymentStatus,
            status: orderStatus,
            date: Date.now()
        };
        console.log('orderData chuẩn bị lưu:', orderData);
        const newOrder = new orderModel(orderData);
        await newOrder.save();
        console.log('Đã lưu order vào DB:', newOrder);

        // --- BƯỚC 2: TRỪ SỐ LƯỢNG TỒN KHO SAU KHI TẠO ĐƠN THÀNH CÔNG ---
        for (const item of items) {
            await productModel.updateOne(
                { _id: item._id, "sizes.size": item.size },
                { $inc: { "sizes.$.stock": -item.quantity } }
            );
        }

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Đặt hàng thành công" });
    } catch (error) {
        console.log('Lỗi controller:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const allOrders = async (req, res) => {
    try {
        const { year, month, day, searchName } = req.body;

        let filter = {};

        // Vì date trong model là Number (timestamp), ta cần tạo khoảng thời gian để query
        if (year && month && day) {
            // Lọc theo ngày cụ thể
            const startDate = new Date(year, month - 1, day);
            startDate.setHours(0, 0, 0, 0); // Bắt đầu ngày
            const endDate = new Date(year, month - 1, day);
            endDate.setHours(23, 59, 59, 999); // Kết thúc ngày
            filter.date = { $gte: startDate.getTime(), $lte: endDate.getTime() };
        } else if (year && month) {
            // Lọc theo tháng
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // Lấy ngày cuối cùng của tháng
            endDate.setHours(23, 59, 59, 999);
            filter.date = { $gte: startDate.getTime(), $lte: endDate.getTime() };
        } else if (year) {
            // Lọc theo năm
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            endDate.setHours(23, 59, 59, 999);
            filter.date = { $gte: startDate.getTime(), $lte: endDate.getTime() };
        }

        // Lọc theo tên khách hàng (nếu có)
        if (searchName) {
            filter['address.fullname'] = { $regex: searchName, $options: 'i' };
        }

        // Sắp xếp theo ngày gần nhất
        const orders = await orderModel.find(filter).sort({ date: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.log('Lỗi allOrders:', error);
        res.status(500).json({ success: false, message: error.message })
    }
}

const userOrders = async (req, res) => {
    try {
        const { userId } = req.body
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error) {
        console.log('Lỗi userOrders:', error);
        res.status(500).json({ success: false, message: error.message })
    }
}

const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        let update = { status };
        // Nếu admin cập nhật trạng thái là Đã giao hàng, coi như đã thanh toán
        if (status === 'Đã giao hàng') {
          update.payment = true;
        }
        await orderModel.findByIdAndUpdate(orderId, update);
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        console.log('Lỗi updateStatus:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const exportOrdersToExcel = async (req, res) => {
    try {
        const { year, month, day, searchName } = req.body;

        let filter = {};
        let reportTitle = 'Báo cáo Doanh thu';

        // Sử dụng lại logic lọc từ hàm allOrders
        if (year && month && day) {
            const startDate = new Date(year, month - 1, day);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(year, month - 1, day);
            endDate.setHours(23, 59, 59, 999);
            filter.date = { $gte: startDate.getTime(), $lte: endDate.getTime() };
            reportTitle += ` Ngày ${day}/${month}/${year}`;
        } else if (year && month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            endDate.setHours(23, 59, 59, 999);
            filter.date = { $gte: startDate.getTime(), $lte: endDate.getTime() };
            reportTitle += ` Tháng ${month}/${year}`;
        } else if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            endDate.setHours(23, 59, 59, 999);
            filter.date = { $gte: startDate.getTime(), $lte: endDate.getTime() };
            reportTitle += ` Năm ${year}`;
        } else {
            reportTitle += ' Toàn Thời Gian';
        }

        // Lọc theo tên khách hàng (nếu có)
        if (searchName) {
            filter['address.fullname'] = { $regex: searchName, $options: 'i' };
            reportTitle += ` (Tìm kiếm: ${searchName})`;
        }

        const orders = await orderModel.find(filter).sort({ date: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Đơn hàng');

        // Thêm tiêu đề báo cáo
        worksheet.mergeCells('A1:H1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = reportTitle;
        titleCell.font = { name: 'Arial', size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center' };
        worksheet.addRow([]); // Dòng trống

        // Thêm tiêu đề cột
        worksheet.columns = [
            { header: 'ID Đơn hàng', key: 'id', width: 30 },
            { header: 'Khách hàng', key: 'customer', width: 25 },
            { header: 'Số điện thoại', key: 'phone', width: 15 },
            { header: 'Địa chỉ', key: 'address', width: 40 },
            { header: 'Ngày đặt', key: 'date', width: 15 },
            { header: 'Tổng tiền (VND)', key: 'amount', width: 20, style: { numFmt: '#,##0' } },
            { header: 'Trạng thái', key: 'status', width: 20 },
            { header: 'Thanh toán', key: 'payment', width: 15 }
        ];
        worksheet.getRow(3).font = { bold: true };

        let totalRevenue = 0;

        // Thêm dữ liệu đơn hàng
        orders.forEach(order => {
            worksheet.addRow({
                id: order._id.toString(),
                customer: order.address.fullname,
                phone: order.address.phone || '',
                address: `${order.address.street || ''}, ${order.address.city || ''}`,
                date: new Date(order.date).toLocaleDateString('vi-VN'),
                amount: order.amount,
                status: order.status,
                payment: order.payment ? 'Đã thanh toán' : 'Chưa'
            });
            totalRevenue += order.amount;
        });

        // Thêm dòng tổng doanh thu
        const summaryRow = worksheet.addRow([]);
        summaryRow.getCell('E').value = 'Tổng Doanh Thu:';
        summaryRow.getCell('E').font = { bold: true };
        summaryRow.getCell('F').value = totalRevenue;
        summaryRow.getCell('F').font = { bold: true };
        summaryRow.getCell('F').numFmt = '#,##0 "VND"';

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="BaoCaoDonHang.xlsx"');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.log('Lỗi exportOrdersToExcel:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { placeOrder, allOrders, userOrders, updateStatus, exportOrdersToExcel }

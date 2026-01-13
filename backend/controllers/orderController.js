import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'

const placeOrder = async (req, res) => {
    console.log('placeOrder controller chạy, req.body:', req.body);
    try {
        const { userId, items, amount, address } = req.body;
        // Kiểm tra đầu vào
        if (!userId) {
            console.log('Thiếu userId');
            return res.status(400).json({ success: false, message: "Thiếu userId!" });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.log('Giỏ hàng trống');
            return res.status(400).json({ success: false, message: "Giỏ hàng trống!" });
        }
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Thanh toán khi nhận hàng",
            payment: false,
            date: Date.now()
        };
        console.log('orderData chuẩn bị lưu:', orderData);
        const newOrder = new orderModel(orderData);
        await newOrder.save();
        console.log('Đã lưu order vào DB:', newOrder);
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Đặt hàng thành công" });
    } catch (error) {
        console.log('Lỗi controller:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({ success: true, orders })
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

export { placeOrder, allOrders, userOrders, updateStatus }

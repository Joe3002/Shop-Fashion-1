import orderModel from '../models/orderModel.js';

// Đặt hàng với thanh toán PayPal
export const placeOrderPaypal = async (req, res) => {
  try {
    const { user, products, total, paymentStatus, paymentProvider, paypalOrderId, payer } = req.body;
    const orderData = {
      userId: user?._id || user?.id || 'unknown',
      items: products,
      amount: total,
      address: user?.address || {},
      status: 'Đã đặt hàng',
      paymentMethod: paymentProvider || 'PayPal',
      payment: paymentStatus === 'Paid',
      date: Date.now(),
      paypalOrderId,
      payer
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();
    res.json({ success: true, message: 'Đặt hàng PayPal thành công!' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

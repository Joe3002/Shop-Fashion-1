import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';

export const getAdminStats = async (req, res) => {
  try {
    // Lấy tất cả đơn hàng (không cần kiểm tra payment)
    const orders = await orderModel.find();
    console.log('Tất cả đơn hàng lấy được cho thống kê:', orders);
    // Thống kê số lượng bán của từng sản phẩm
    const productSales = {};
    let totalSold = 0;

    orders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!item._id) return;
        if (!productSales[item._id]) {
          productSales[item._id] = { name: item.name, sold: 0 };
        }
        productSales[item._id].sold += item.quantity || 1;
        totalSold += item.quantity || 1;
      });
    });
    // Lấy thông tin sản phẩm ế (chưa bán được)
    const allProducts = await productModel.find();
    const unsoldProducts = allProducts.filter(p => !productSales[p._id]);
    // Sắp xếp sản phẩm bán chạy
    const bestSellers = Object.entries(productSales)
      .sort((a, b) => b[1].sold - a[1].sold)
      .map(([id, info]) => ({ _id: id, ...info }));
    // Thống kê doanh thu tổng
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = allProducts.length;

    // --- LOG KIỂM TRA DỮ LIỆU ---
    console.log('--- ADMIN STATS DEBUG ---');
    console.log('Tổng đơn hàng tìm thấy:', totalOrders);
    console.log('Tổng sản phẩm tìm thấy:', totalProducts);
    console.log('Tổng số lượng đã bán:', totalSold);
    // -----------------------------

    // Thống kê doanh thu theo ngày
    // { '2025-10-17': 100000, ... }
    let revenueByDate = {};
    if (orders.length > 0) {
      orders.forEach(order => {
        if (!order.date || !order.amount) return;
        const d = new Date(order.date);
        // Định dạng yyyy-mm-dd
        const dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
        if (!revenueByDate[dateStr]) revenueByDate[dateStr] = 0;
        revenueByDate[dateStr] += order.amount;
      });
    }
    res.json({
      success: true,
      totalRevenue,
      totalOrders,
      totalProducts,
      totalSold,
      bestSellers,
      unsoldProducts: unsoldProducts.map(p => ({ _id: p._id, name: p.name })),
      revenueByDate
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

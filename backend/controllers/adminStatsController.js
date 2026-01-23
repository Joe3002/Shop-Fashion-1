import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';

export const getAdminStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : null; // Nếu null là chọn "Cả năm"

    // 1. Lấy đơn hàng trong NĂM được chọn (để vẽ biểu đồ 12 tháng)
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const ordersInYear = await orderModel.find({
        date: { $gte: startOfYear.getTime(), $lte: endOfYear.getTime() }
    });

    // Tính doanh thu cho 12 tháng
    const monthlyRevenueArray = Array(12).fill(0);
    ordersInYear.forEach(order => {
        const d = new Date(order.date);
        const m = d.getMonth(); // 0-11
        monthlyRevenueArray[m] += order.amount || 0;
    });

    // 2. Lọc đơn hàng cho phần Tổng quan & Biểu đồ ngày (dựa trên tháng được chọn)
    let ordersFiltered = ordersInYear;
    if (currentMonth) {
        ordersFiltered = ordersInYear.filter(order => {
            const d = new Date(order.date);
            return (d.getMonth() + 1) === currentMonth;
        });
    }

    // 3. Tính toán các chỉ số tổng quan (dựa trên ordersFiltered)
    const totalRevenue = ordersFiltered.reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalOrders = ordersFiltered.length;
    const totalProducts = await productModel.countDocuments({}); // Tổng sản phẩm trong kho

    const productSales = {};
    let totalSold = 0;
    
    ordersFiltered.forEach(order => {
      (order.items || []).forEach(item => {
        if (!item._id) return;
        if (!productSales[item._id]) {
          productSales[item._id] = { name: item.name, sold: 0, revenue: 0 };
        }
        productSales[item._id].sold += item.quantity || 1;
        productSales[item._id].revenue += (item.price || 0) * (item.quantity || 1);
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

    // Thống kê doanh thu theo ngày (cho biểu đồ Line)
    let revenueByDate = {};
    
    // Nếu đang lọc theo tháng, ta khởi tạo sẵn các ngày trong tháng đó với giá trị 0
    if (currentMonth) {
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dateKey = `${i}/${currentMonth}`;
            revenueByDate[dateKey] = 0;
        }
    }

    if (ordersFiltered.length > 0) {
      ordersFiltered.forEach(order => {
        if (!order.date || !order.amount) return;
        const d = new Date(order.date);
        // Định dạng ngày/tháng
        const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
        
        if (revenueByDate[dateStr] === undefined) revenueByDate[dateStr] = 0;
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
      revenueByDate,
      monthlyRevenueArray // Dữ liệu mới: Doanh thu 12 tháng
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

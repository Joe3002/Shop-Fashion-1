import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const AdminStats = ({ backendUrl, token }) => {
  // Đảm bảo chỉ khai báo biến phụ thuộc stats sau khi đã có stats


  // State lưu trữ dữ liệu thống kê, trạng thái loading và lỗi
  const [stats, setStats] = useState(null); // Lưu dữ liệu thống kê lấy từ backend
  const [loading, setLoading] = useState(true); // Đang tải dữ liệu?
  const [error, setError] = useState(''); // Lỗi khi lấy dữ liệu

  // Khi component mount hoặc token/backendUrl thay đổi, gọi API lấy dữ liệu thống kê
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        // Gửi request lên backend để lấy thống kê admin
        const res = await axios.get(`${backendUrl}/api/user/admin/stats`, {
          headers: { token }
        });
        // Nếu thành công, lưu dữ liệu vào state
        if (res.data.success) setStats(res.data);
        else setError(res.data.message || 'Lỗi lấy thống kê');
      } catch (err) {
        setError(err.message || 'Lỗi lấy thống kê');
      }
      setLoading(false);
    };
    if (token) fetchStats();
  }, [backendUrl, token]);

  if (loading) return <div>Đang tải thống kê...</div>;
  if (error) return <div className='text-red-500'>Lỗi: {error}</div>;
  if (!stats) return null;

  // Xử lý dữ liệu thống kê để truyền vào biểu đồ
  // Lấy nhãn và dữ liệu doanh thu theo ngày
  let revenueDateLabels = [];
  let revenueDateData = [];
  if (stats.revenueByDate) {
    revenueDateLabels = Object.keys(stats.revenueByDate).sort(); // Danh sách ngày
    revenueDateData = revenueDateLabels.map(date => stats.revenueByDate[date]); // Doanh thu từng ngày
  }
  // Lấy nhãn và dữ liệu sản phẩm bán chạy
  const bestSellerLabels = stats.bestSellers.map(p => p.name); // Tên sản phẩm bán chạy
  const bestSellerData = stats.bestSellers.map(p => p.sold); // Số lượng bán

  return (
    <div className='w-full'>
      <h2 className='text-2xl font-bold mb-6 text-gray-800'>Tổng Quan Hệ Thống</h2>
      
      {/* Cards Summary */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500'>
          <p className='text-gray-500 text-sm font-medium'>TỔNG DOANH THU</p>
          <p className='text-2xl font-bold text-gray-800 mt-2'>{(stats.totalRevenue || 0).toLocaleString()} ₫</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500'>
          <p className='text-gray-500 text-sm font-medium'>TỔNG ĐƠN HÀNG</p>
          <p className='text-2xl font-bold text-gray-800 mt-2'>{stats.totalOrders || 0}</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500'>
          <p className='text-gray-500 text-sm font-medium'>TỔNG SẢN PHẨM</p>
          <p className='text-2xl font-bold text-gray-800 mt-2'>{stats.totalProducts || 0}</p>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500'>
          <p className='text-gray-500 text-sm font-medium'>ĐÃ BÁN (ITEMS)</p>
          <p className='text-2xl font-bold text-gray-800 mt-2'>{stats.totalSold || 0}</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Biểu đồ doanh thu theo ngày */}
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h3 className='text-lg font-semibold mb-4 text-gray-700'>Xu Hướng Doanh Thu</h3>
          <div className='h-80'>
            {revenueDateLabels.length > 0 ? (
              <Line
                data={{
                  labels: revenueDateLabels,
                  datasets: [
                    {
                      label: 'Doanh thu (VND)',
                      data: revenueDateData,
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      tension: 0.3,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            ) : (
              <div className='flex items-center justify-center h-full text-gray-400'>Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Biểu đồ sản phẩm bán chạy */}
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h3 className='text-lg font-semibold mb-4 text-gray-700'>Top Sản Phẩm Bán Chạy</h3>
          <div className='h-80'>
            {bestSellerLabels.length > 0 ? (
              <Bar
                data={{
                  labels: bestSellerLabels.slice(0, 10), // Chỉ lấy top 10 để hiển thị cho đẹp
                  datasets: [
                    {
                      label: 'Số lượng bán',
                      data: bestSellerData.slice(0, 10),
                      backgroundColor: 'rgba(59, 130, 246, 0.7)',
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                    x: { ticks: { display: false } } // Ẩn tên sản phẩm ở trục X nếu quá dài
                  },
                }}
              />
            ) : (
              <div className='flex items-center justify-center h-full text-gray-400'>Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Danh sách chi tiết bán chạy */}
        <div className='bg-white p-6 rounded-lg shadow-md max-h-96 overflow-y-auto'>
          <h3 className='text-lg font-semibold mb-4 text-gray-700 sticky top-0 bg-white'>Chi Tiết Bán Chạy</h3>
          <ul className='divide-y divide-gray-100'>
            {stats.bestSellers.length === 0 && <li className='text-gray-500 py-2'>Chưa có sản phẩm bán</li>}
            {stats.bestSellers.map((p, index) => (
              <li key={p._id} className='py-3 flex justify-between items-center'>
                <div className='flex items-center gap-3'>
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {index + 1}
                  </span>
                  <span className='text-gray-700 font-medium truncate max-w-[200px] sm:max-w-xs' title={p.name}>{p.name}</span>
                </div>
                <span className='bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded'>
                  {p.sold} đã bán
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Danh sách sản phẩm tồn kho/chưa bán */}
        <div className='bg-white p-6 rounded-lg shadow-md max-h-96 overflow-y-auto'>
          <h3 className='text-lg font-semibold mb-4 text-gray-700 sticky top-0 bg-white'>Sản Phẩm Chưa Bán Được</h3>
          <ul className='divide-y divide-gray-100'>
            {stats.unsoldProducts.length === 0 && <li className='text-green-500 py-2'>Tuyệt vời! Tất cả sản phẩm đã được bán.</li>}
            {stats.unsoldProducts.map((p, index) => (
              <li key={p._id} className='py-3 flex items-center gap-2'>
                <span className='w-2 h-2 bg-red-400 rounded-full'></span>
                <span className='text-gray-600 truncate' title={p.name}>{p.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;

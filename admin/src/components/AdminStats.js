import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminStats = ({ backendUrl, token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${backendUrl}/api/user/admin/stats`, {
          headers: { token }
        });
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

  return (
    <div className='p-6 bg-white rounded shadow'>
      <h2 className='text-xl font-bold mb-4'>Thống kê doanh thu & sản phẩm</h2>
      <div className='mb-4'>
        <b>Tổng doanh thu:</b> <span className='text-green-600 font-semibold'>{stats.totalRevenue.toLocaleString()} VND</span>
      </div>
      <div className='mb-4'>
        <b>Sản phẩm bán chạy:</b>
        <ul className='list-disc ml-6'>
          {stats.bestSellers.length === 0 && <li>Chưa có sản phẩm bán</li>}
          {stats.bestSellers.map(p => (
            <li key={p._id}>{p.name} <span className='text-gray-500'>(Đã bán: {p.sold})</span></li>
          ))}
        </ul>
      </div>
      <div>
        <b>Sản phẩm chưa bán được:</b>
        <ul className='list-disc ml-6'>
          {stats.unsoldProducts.length === 0 && <li>Tất cả sản phẩm đã bán</li>}
          {stats.unsoldProducts.map(p => (
            <li key={p._id}>{p.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminStats;

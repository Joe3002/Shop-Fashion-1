import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl,formatVND } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { saveAs } from 'file-saver'

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [filters, setFilters] = useState({
    day: '',
    month: '',
    year: '',
    searchName: '' // Thêm state tìm kiếm theo tên
  })
  const [isExporting, setIsExporting] = useState(false)

  const fetchAllOrders = async () => {
    if (!token) return

    try {
      const activeFilters = {};
      if (filters.day) activeFilters.day = parseInt(filters.day);
      if (filters.month) activeFilters.month = parseInt(filters.month);
      if (filters.year) activeFilters.year = parseInt(filters.year);
      if (filters.searchName) activeFilters.searchName = filters.searchName.trim();

      const response = await axios.post(
        backendUrl + '/api/order/list',
        activeFilters,
        { headers: { token } }
      )
      if (response.data.success) {
        setOrders(response.data.orders)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAllOrders();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
        const activeFilters = {};
        if (filters.day) activeFilters.day = parseInt(filters.day);
        if (filters.month) activeFilters.month = parseInt(filters.month);
        if (filters.year) activeFilters.year = parseInt(filters.year);
        if (filters.searchName) activeFilters.searchName = filters.searchName;

        const response = await axios.post(`${backendUrl}/api/order/export`, activeFilters, {
            headers: { token },
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'BaoCaoDonHang.xlsx');
        toast.success("Xuất file Excel thành công!");
    } catch (error) {
        toast.error("Lỗi khi xuất file Excel.");
    } finally {
        setIsExporting(false);
    }
  };

  const statusHandler = async (event, orderId) =>{
    try {
      const newStatus = event.target.value;
      const response = await axios.post(backendUrl+ '/api/order/status',{orderId, status: newStatus},{headers:{token}})
      if (response.data.success) {
        toast.success('Cập nhật trạng thái thành công!');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }
  useEffect(() => {
    fetchAllOrders()
  }, [token])

  // Hàm xử lý hiển thị size an toàn
  const formatSize = (sizeData) => {
    if (!sizeData) return '';
    if (typeof sizeData === 'string') return sizeData;
    if (Array.isArray(sizeData)) {
      const first = sizeData[0];
      return typeof first === 'object' ? (first.size || '') : first;
    }
    if (typeof sizeData === 'object') {
      return sizeData.size || sizeData[0] || ''; // Lấy size từ key 'size' hoặc key '0'
    }
    return '';
  };

  return (
    <div>
      <h3>Danh sách đơn hàng</h3>
      
      <div className="flex items-center flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-md border mt-4">
        <form onSubmit={handleFilterSubmit} className="flex items-center flex-wrap gap-4">
            <input type="text" name="searchName" value={filters.searchName} onChange={handleFilterChange} placeholder="Tên khách hàng" className="border px-2 py-1.5 rounded-md w-40" />
            <input type="number" name="day" value={filters.day} onChange={handleFilterChange} placeholder="Ngày" className="border px-2 py-1.5 rounded-md w-24" />
            <input type="number" name="month" value={filters.month} onChange={handleFilterChange} placeholder="Tháng" className="border px-2 py-1.5 rounded-md w-24" />
            <input type="number" name="year" value={filters.year} onChange={handleFilterChange} placeholder="Năm" className="border px-2 py-1.5 rounded-md w-28" />
            <button type="submit" className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'>Lọc</button>
        </form>
        <button 
            type="button" 
            onClick={handleExport}
            disabled={isExporting}
            className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400'
        >
            {isExporting ? 'Đang xử lý...' : 'Xuất Excel'}
        </button>
      </div>

      <div>
        {orders.map((order, index) => (
          <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index} >
            <img className='w-12' src={assets.parcel_icon} alt="Parcel Icon" />
            <div>
              <div>
                {order.items.map((item, idx) => {
                  if (idx === order.items.length - 1) {
                    return (
                      <p className='py-0.5' key={idx}>
                        {item.name} x {item.quantity} <span> {formatSize(item.size)}</span>
                      </p>
                    )
                  } else {
                    return <p className='py-0.5' key={idx}>
                      {item.name} x {item.quantity} <span> {formatSize(item.size)}</span>,
                    </p>
                  }
                })}
              </div>
              <p className='mt-3 mb-2 font-medium'>{order.address.fullname + ""}</p>
              <div>
                <p>{order.address.street + ","}</p>
                <p>{order.address.city}</p>
              </div>
              <p>{order.address.phone}</p>
            </div>
            <div>
              <p className='text-sm sm:text-[15px]'>Số lượng: {order.items.length} </p>
              <p className='mt-3'>Phương thức thanh toán : {order.paymentMethod}</p>
              <p>Thanh toán : {order.payment ? 'Đã thanh toán':'Đang chờ'}</p>
              <p> Ngày đặt : {new Date(order.date).toLocaleDateString('vi-VN')}</p>
            </div>
            <p className='text-sm sm:text-[15px]'>{formatVND(order.amount)}</p>
            <select onChange={(event)=>statusHandler(event,order._id)} className='p-2 font-semibold' value={order.status}>
              <option  value="Đã đặt hàng">Đã đặt hàng</option>
              <option value="Đóng gói">Đóng gói</option>
              <option value="Đã vận chuyển">Đã vận chuyển</option>
              <option value="Đang giao hàng">Đang giao hàng</option>
              <option value="Đã giao hàng">Đã giao hàng</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders

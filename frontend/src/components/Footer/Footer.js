import React from 'react'
import {assets} from '../../assets/assets'
const Footer = () => {
  return (
    <div>
      <div className='w-full grid grid-cols-1 md:grid-cols-4 gap-8 my-10 text-sm pt-20 items-start'>
        <div>
          <img className='mb-5 w-32' src={assets.logo1} alt="" />
          <p className='w-full md:w-3/2 text-gray-600'>
            Sứ mệnh của chúng tôi là trao quyền cho khách hàng với sự lựa chọn, tiện lợi và sự tự tin. Chúng tôi cam kết cung cấp trải nghiệm mua sắm liền mạch vượt quá mong đợi, từ việc duyệt và đặt hàng đến giao hàng và hơn thế nữa
          </p>
        </div>
        <div>
          <p className='text-xl font-medium mb-5'>SHOP</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li>Trang Chủ</li>
            <li>Thông Tin</li>
            <li>Vận Chuyển</li>
            <li>Chính Sách Bảo Mật</li>
          </ul>
        </div>
        <div>
          <p className='text-xl font-medium mb-5'>LIÊN HỆ</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li>0347329564</li>
            <li>hoangquanat@gmail.com</li>
          </ul>
        </div>
        <div className='flex flex-col items-center'>
          <p className='text-xl font-medium mb-5'>BẢN ĐỒ</p>
          {/* Tích hợp Google Map: nhúng iframe bản đồ Google để hiển thị vị trí cửa hàng */}
          <iframe
            title="Google Map"
            src="https://www.google.com/maps?q=173+Trần+Cung,+Hà+Nội&output=embed"
            width="100%"
            height="180"
            style={{ border: 0, minWidth: 180, maxWidth: 300 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
      <div>
        <hr/>
        <p className='py-5 text-sm text-center'>hoangquanat@gmail.com</p>
      </div>
    </div>
  )
}

export default Footer

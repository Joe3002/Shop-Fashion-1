import React, { useContext, useEffect, useState } from 'react'
import Title from '../components/LatesCollection/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/Newletter/NewsletterBox'
import { ShopContext } from '../context/ShopContext/ShopContext'

const Contact = () => {
  const { user } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Tự động điền thông tin nếu user đã đăng nhập
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData(data => ({ ...data, [name]: value }));
  }

  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
          <Title text1={'LIÊN HỆ'} text2={'VỚI CHÚNG TÔI'} />
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Cửa hàng của chúng tôi</p>
          <p className='text-gray-500'>54709 Willms Station <br /> Suite 350, Washington, USA</p>
          <p className='text-gray-500'>Tel: (415) 555-0132 <br /> Email: admin@forever.com</p>
          
          <p className='font-semibold text-xl text-gray-600'>Gửi tin nhắn</p>
          <form className='flex flex-col gap-4 w-full sm:max-w-md'>
             <input name='name' onChange={onChangeHandler} value={formData.name} type="text" placeholder='Họ và tên' className='border border-gray-300 rounded py-2 px-4 w-full' />
             <input name='email' onChange={onChangeHandler} value={formData.email} type="email" placeholder='Email' className='border border-gray-300 rounded py-2 px-4 w-full' />
             <input name='phone' onChange={onChangeHandler} value={formData.phone} type="tel" placeholder='Số điện thoại' className='border border-gray-300 rounded py-2 px-4 w-full' />
             <textarea name='message' onChange={onChangeHandler} value={formData.message} placeholder='Nội dung tin nhắn' className='border border-gray-300 rounded py-2 px-4 w-full h-32 resize-none'></textarea>
             <button className='bg-black text-white px-8 py-2 text-sm hover:bg-gray-800 transition-all duration-500'>GỬI NGAY</button>
          </form>
        </div>
      </div>
      <NewsletterBox />
    </div>
  )
}

export default Contact
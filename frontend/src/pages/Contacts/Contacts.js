import React, { useEffect, useState, useContext } from 'react'
import Title from '../../components/LatesCollection/Title'
import {assets} from '../../assets/assets'
import NewsletterBox from '../../components/Newletter/NewsletterBox'
import axios from 'axios'
import { backendUrl } from '../../App'
import { ShopContext } from '../../context/ShopContext/ShopContext'
const Contacts = () => {
  const { token } = useContext(ShopContext);
  const [user, setUser] = useState({})
  useEffect(() => {
    const fetchUser = async () => {
      console.log('Fetching user data...');
      console.log('Token:', token);
      try {
        const res = await axios.get(`${backendUrl}/api/user/me`, { headers: { token } })
        if (res.data.success) setUser(res.data.user)
      } catch (error) {
        console.error('Contacts user fetch error:', error);
      }
    }
    if (token) fetchUser()
  }, [token])
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title  text1={'LIÊN HỆ VỚI'} text2={'CHÚNG TÔI'}/>
      </div>
      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Thông tin khách hàng</p>
          <p className='text-gray-500'>Tên: {user.name || 'Chưa có'} <br/> Email: {user.email || 'Chưa có'}</p>
          <hr className='my-4'/>
          <p className='font-semibold text-xl text-gray-600'>Cửa hàng của chúng tôi</p>
          <p className=' text-gray-500'>Hà nội<br/>Trần cung </p>
          <p className=' text-gray-500'> SĐT: 0347329564 <br/> Email: hoangquanat@gmail.com</p>
          <p className='font-semibold text-xl text-gray-600'>Sự nghiệp tại Fashion</p>
          <p className=' text-gray-500'>Tìm hiểu thêm về các nhóm và việc làm của chúng tôi.</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Khám phá việc làm</button>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default Contacts

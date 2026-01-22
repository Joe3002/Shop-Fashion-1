import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const ListUsers = ({ token, backendUrl }) => {
  const [list, setList] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', userId: '' })

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/user/list', { headers: { token } })
      if (response.data.success) {
        setList(response.data.users)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeUser = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const response = await axios.post(backendUrl + '/api/user/delete', { id }, { headers: { token } })
        if (response.data.success) {
          toast.success(response.data.message)
          await fetchList()
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
        let response;
        if (isEditing) {
            response = await axios.post(backendUrl + '/api/user/update', formData, { headers: { token } })
        } else {
            response = await axios.post(backendUrl + '/api/user/add', formData, { headers: { token } })
        }

        if (response.data.success) {
            toast.success(response.data.message)
            setFormData({ name: '', email: '', password: '', userId: '' })
            setIsEditing(false)
            await fetchList()
        } else {
            toast.error(response.data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
  }

  const handleEdit = (user) => {
      setFormData({ name: user.name, email: user.email, password: '', userId: user._id })
      setIsEditing(true)
      window.scrollTo(0, 0)
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className='p-4 w-full'>
      <p className='mb-4 text-xl font-bold'>Quản lý người dùng</p>
      
      {/* Form Thêm/Sửa */}
      <form onSubmit={handleSubmit} className='mb-8 bg-gray-50 p-4 rounded border shadow-sm max-w-lg'>
          <h3 className='mb-3 font-semibold text-lg'>{isEditing ? 'Cập nhật thông tin' : 'Thêm người dùng mới'}</h3>
          <div className='flex flex-col gap-3'>
              <input type="text" placeholder='Tên hiển thị' required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className='border p-2 rounded outline-none focus:border-black'/>
              <input type="email" placeholder='Email' required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className='border p-2 rounded outline-none focus:border-black'/>
              <input 
                type="password" 
                placeholder={isEditing ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'} 
                required={!isEditing} 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                className='border p-2 rounded outline-none focus:border-black'/>
              <div className='flex gap-2 mt-2'>
                <button type='submit' className='bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors'>{isEditing ? 'Cập nhật' : 'Thêm'}</button>
                {isEditing && <button type='button' onClick={() => { setIsEditing(false); setFormData({ name: '', email: '', password: '', userId: '' }) }} className='bg-gray-200 text-black px-6 py-2 rounded hover:bg-gray-300 transition-colors'>Hủy</button>}
              </div>
          </div>
      </form>

      {/* Danh sách */}
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_2fr_1fr_1fr] items-center py-2 px-4 border bg-gray-100 text-sm font-bold'>
          <span>Tên</span>
          <span>Email</span>
          <span>Loại tài khoản</span>
          <span className='text-center'>Hành động</span>
        </div>
        {list.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr_1fr_1fr] items-center gap-2 py-2 px-4 border text-sm hover:bg-gray-50' key={index}>
            <p className='font-medium'>{item.name}</p>
            <p>{item.email}</p>
            <p className='capitalize'>{item.type || 'login'}</p>
            <div className='flex justify-center gap-3'>
                <p onClick={() => handleEdit(item)} className='cursor-pointer text-blue-600 hover:underline'>Sửa</p>
                <p onClick={() => removeUser(item._id)} className='cursor-pointer text-red-600 hover:underline'>Xóa</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListUsers
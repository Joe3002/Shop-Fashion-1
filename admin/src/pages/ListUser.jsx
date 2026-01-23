import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const ListUser = ({ token, backendUrl }) => {
    const [users, setUsers] = useState([])
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '', password: '', userId: '' })

    const fetchUsers = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/user/list', { headers: { token } })
            if (response.data.success) {
                setUsers(response.data.users)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(error.message)
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
                fetchUsers()
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

    const removeUser = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
            try {
                const response = await axios.post(backendUrl + '/api/user/delete', { id }, { headers: { token } })
                if (response.data.success) {
                    toast.success(response.data.message)
                    fetchUsers()
                } else {
                    toast.error(response.data.message)
                }
            } catch (error) {
                toast.error(error.message)
            }
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <div className='w-full p-4'>
            <h3 className='font-semibold text-lg mb-4'>Quản lý người dùng</h3>

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

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tên</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Số điện thoại</th>
                            <th scope="col" className="px-6 py-3">Địa chỉ</th>
                            <th scope="col" className="px-6 py-3 text-center">Số đơn hàng</th>
                            <th scope="col" className="px-6 py-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.phone || 'Chưa cập nhật'}</td>
                                <td className="px-6 py-4">{user.address || 'Chưa cập nhật'}</td>
                                <td className="px-6 py-4 text-center font-semibold">{user.orderCount || 0}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => handleEdit(user)} className="font-medium text-blue-600 hover:underline">Sửa</button>
                                        <button onClick={() => removeUser(user._id)} className="font-medium text-red-600 hover:underline">Xóa</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <p className='text-center py-10'>Không tìm thấy người dùng nào.</p>}
            </div>
        </div>
    )
}

export default ListUser
import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, token, backendUrl, setUser } = useContext(ShopContext);
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        dob: ''
    });

    // Cập nhật state khi user thay đổi
    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                dob: user.dob || ''
            });
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(backendUrl + '/api/user/update-profile', userData, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                setIsEditing(false);
                // Cập nhật lại thông tin user trong context để hiển thị ngay lập tức
                setUser(prev => ({ ...prev, ...userData }));
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <div className='border-t pt-16 px-4 sm:px-0'>
            <div className='text-2xl mb-3'>
                <h2>Thông tin cá nhân</h2>
            </div>
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='flex flex-col gap-2'>
                    <p>Họ và tên</p>
                    <input 
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full' 
                        type="text" 
                        value={userData.name} 
                        onChange={e => setUserData({...userData, name: e.target.value})}
                        disabled={!isEditing}
                    />
                </div>
                <div className='flex flex-col gap-2'>
                    <p>Email</p>
                    <input 
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full bg-gray-100' 
                        type="email" 
                        value={userData.email} 
                        disabled={true} // Email không cho phép sửa
                    />
                </div>
                <div className='flex flex-col gap-2'>
                    <p>Số điện thoại</p>
                    <input 
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full' 
                        type="text" 
                        value={userData.phone} 
                        onChange={e => setUserData({...userData, phone: e.target.value})}
                        disabled={!isEditing}
                        placeholder='Thêm số điện thoại'
                    />
                </div>
                <div className='flex flex-col gap-2'>
                    <p>Địa chỉ</p>
                    <input 
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full' 
                        type="text" 
                        value={userData.address} 
                        onChange={e => setUserData({...userData, address: e.target.value})}
                        disabled={!isEditing}
                        placeholder='Thêm địa chỉ'
                    />
                </div>
                <div className='flex flex-col gap-2'>
                    <p>Ngày sinh</p>
                    <input 
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full' 
                        type="date" 
                        value={userData.dob} 
                        onChange={e => setUserData({...userData, dob: e.target.value})}
                        disabled={!isEditing}
                    />
                </div>

                <div className='mt-4'>
                    {isEditing ? (
                        <div className='flex gap-4'>
                            <button onClick={handleUpdate} className='bg-black text-white px-8 py-2 rounded hover:bg-gray-800'>Lưu</button>
                            <button onClick={() => setIsEditing(false)} className='bg-gray-200 text-black px-8 py-2 rounded hover:bg-gray-300'>Hủy</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className='bg-black text-white px-8 py-2 rounded hover:bg-gray-800'>Chỉnh sửa</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

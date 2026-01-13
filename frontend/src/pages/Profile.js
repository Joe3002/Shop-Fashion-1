import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { ShopContext } from '../context/ShopContext/ShopContext';

const Profile = () => {
  const { token } = useContext(ShopContext);
  const [user, setUser] = useState({});
  useEffect(() => {
    const fetchUser = async () => {
      console.log('Fetching user data...');
      console.log('Token:', token);
      try {
        const res = await axios.get(`${backendUrl}/api/user/me`, { headers: { token } });
        console.log('API /me trả về:', res.data);
        if (res.data.success) setUser(res.data.user);
      } catch (error) {
        console.error('Profile user fetch error:', error);
      }
    };
    if (token) fetchUser();
  }, [token]);
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Thông tin khách hàng</h2>
      <div className='pb-2 border-b'>
    <p className='font-medium'>{user?.name || 'Khách'}</p>
    {user?.email && <p className='text-xs text-gray-500'>{user.email}</p>}
    </div>
    </div>
  );
};

export default Profile;

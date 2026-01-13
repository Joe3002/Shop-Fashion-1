// ...existing code...
import React, { useContext, useState, useRef, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext/ShopContext';

const Navbar = () => {
  const [visibale, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { setShowSearch, getCartCount, navigate, token, user, logout, setCartItems } = useContext(ShopContext);
  const wrapperRef = useRef(null);

  // close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onProfileClick = () => {
    if (!token && !user) {
      navigate('/login');
      return;
    }
    setMenuOpen((v) => !v);
  }

  const handleLogout = () => {
    // use context logout if available
    if (typeof logout === 'function') {
      logout();
    } else {
      // fallback
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setCartItems({})
      navigate('/login')
    }
    setMenuOpen(false)
  }

  return (
    <div className='flex items-center justify-between py-5 font-medium' >
      <Link to='/'><img src={assets.logo1} alt="" /></Link>
      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        <NavLink to='/' className='flex flex-col items-center gap-1 '>
          <p>TRANG CHỦ</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden ' />
        </NavLink>
        <NavLink to='/collection' className='flex flex-col items-center gap-1'>
          <p>BỘ SƯU TẬP</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/about' className='flex flex-col items-center gap-1'>
          <p>VỀ FASHION</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/contacts' className='flex flex-col items-center gap-1'>
          <p>LIÊN HỆ</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
      </ul>
      <div className='flex items-center gap-6'>
        <img onClick={() => setShowSearch(true)} src={assets.search_icon} className='w-5 cursor-pointer' alt="" />
        <div className='relative' ref={wrapperRef}>
          <button onClick={onProfileClick} className='focus:outline-none'>
            {user?.avatar
              ? <img src={user.avatar} className='w-6 h-6 rounded-full' alt="avatar" />
              : <img src={assets.profile_icon} className='w-5 cursor-pointer' alt="profile" />
            }
          </button>

          {menuOpen && (
            <div className='absolute right-0 mt-2 w-44 z-50'>
              <div className='flex flex-col gap-2 w-full py-3 px-4 bg-slate-100 text-gray-700 rounded shadow'>
                <div className='pb-2 border-b'>
                  <p className='font-medium'>{user?.name || 'Khách'}</p>
                  {user?.email && <p className='text-xs text-gray-500'>{user.email}</p>}
                </div>
                <button onClick={() => { navigate('/profile'); setMenuOpen(false) }} className='text-left hover:text-black'>Thông tin</button>
                <button onClick={() => { navigate('/orders'); setMenuOpen(false) }} className='text-left hover:text-black'>Đơn hàng</button>
                <button onClick={handleLogout} className='text-left hover:text-black'>Đăng Xuất</button>
              </div>
            </div>
          )}
        </div>
        <Link to='/cart' className='relative'>
          <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
          <p className=' absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
        </Link>
        <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" />
      </div>
      <div className={`absolute top-0 bottom-0 overflow-hidden bg-white transition-all ${visibale ? 'w-full' : 'w-0'}`}>
        <div className='flex flex-col text-gray-600'>
          <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
            <img className='h-4 rotate-180 ' src={assets.dropdown_icon} alt="" />
            <p>Trở lại</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/'>TRANG CHỦ</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/collection'>BỘ SƯU TẬP</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/about'>VỀ FASHION</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contacts'>LIÊN HỆ</NavLink>
        </div>
      </div>
    </div>
  )
}

export default Navbar
// ...existing code...
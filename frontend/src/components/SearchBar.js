import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext/ShopContext';
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';

const SearchBar = () => {
    const { search, setSearch, showSearch, setShowSearch, products, navigate, formatPrice } = useContext(ShopContext);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const location = useLocation();

    // Ẩn thanh tìm kiếm khi chuyển trang
    useEffect(() => {
        setShowSearch(false);
    }, [location.pathname, setShowSearch]);

    // Logic lọc sản phẩm theo từ khóa
    useEffect(() => {
        if (search && products.length > 0) {
            const filtered = products.filter(item => 
                item.name.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredProducts(filtered.slice(0, 5)); // Giới hạn hiển thị 5 kết quả
        } else {
            setFilteredProducts([]);
        }
    }, [search, products]);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        setShowSearch(false);
        setSearch('');
        setFilteredProducts([]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            navigate('/collection');
            setShowSearch(false);
            setFilteredProducts([]);
        }
    }

    if (!showSearch) return null;

    return (
        <div className='border-t border-b bg-gray-50 text-center relative'>
            <div className='inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2'>
                <input 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    className='flex-1 outline-none bg-inherit text-sm' 
                    type="text" 
                    placeholder='Tìm kiếm sản phẩm...' 
                />
                <img className='w-4' src={assets.search_icon} alt="" />
            </div>
            <img onClick={() => setShowSearch(false)} className='inline w-3 cursor-pointer' src={assets.cross_icon} alt="" />

            {/* Danh sách gợi ý tìm kiếm (Dropdown) */}
            {search && (
                <div className='absolute left-0 right-0 mx-auto w-3/4 sm:w-1/2 bg-white shadow-xl border rounded-b-lg z-50 max-h-60 overflow-y-auto top-[70px]'>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((item) => (
                            <div 
                                key={item._id} 
                                onClick={() => handleProductClick(item._id)}
                                className='flex items-center gap-3 p-3 border-b hover:bg-gray-100 cursor-pointer text-left transition-colors'
                            >
                                <img src={item.image[0]} alt={item.name} className='w-10 h-10 object-cover rounded' />
                                <div className='flex-1'>
                                    <p className='text-sm font-medium text-gray-800 truncate'>{item.name}</p>
                                    <p className='text-xs text-gray-500'>{formatPrice(item.price)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='p-4 text-gray-500 text-sm'>
                            Không tìm thấy sản phẩm nào.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = '';
  const delivery_fee = 20000;
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  // load token + user from localStorage at init
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Đảm bảo user luôn có đủ trường _id, name, email, type
      return parsed && parsed._id ? parsed : {
        _id: parsed?._id || '',
        name: parsed?.name || '',
        email: parsed?.email || '',
        type: parsed?.type || 'loginGoogle'
      };
    } catch {
      return null;
    }
  });

  // getUserCart & getProductsData wrapped in useCallback to satisfy eslint deps
  const getUserCart = useCallback(async (tokenToUse) => {
    try {
      const authToken = tokenToUse || token;
      const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token: authToken } });
      if (response.data?.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (error) {
      // ignore cart errors silently
      console.log('getUserCart error', error?.message || error);
    }
  }, [backendUrl, token]);

  const getProductsData = useCallback(async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data?.success) {
        setProducts(response.data.products || []);
      } else {
        toast.error(response.data?.message || 'Failed to load products');
      }
    } catch (error) {
      console.log('getProductsData error', error);
      toast.error(error?.message || 'Failed to load products');
    }
  }, [backendUrl]);

  const getUserProfile = useCallback(async (tokenToUse) => {
    try {
      const authToken = tokenToUse || token;
      const response = await axios.post(backendUrl + '/api/user/me', {}, { headers: { token: authToken } });
      if (response.data?.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('getUserProfile error', error);
    }
  }, [backendUrl, token]);

  // keep axios default header 'token' in sync and fetch cart when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['token'] = token;
      localStorage.setItem('token', token);
      getUserCart(token);
      getUserProfile(token);
    } else {
      delete axios.defaults.headers.common['token'];
      localStorage.removeItem('token');
      setCartItems({});
      setUser(null);
    }
  }, [token, getUserCart, getUserProfile]);

  // persist user
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // load products once
  useEffect(() => {
    getProductsData();
  }, [getProductsData]);

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error('Bạn Chưa Chọn Size');
      return;
    }
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);
    if (token) {
      try {
        const response = await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } });
        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error?.message || 'Thêm giỏ hàng thất bại');
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) { /* ignore */ }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);
    if (token) {
      try {
        await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } });
      } catch (error) {
        console.log(error);
        toast.error(error?.message || 'Cập nhật giỏ hàng thất bại');
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0 && itemInfo) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) { /* ignore */ }
      }
    }
    return totalAmount;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setCartItems({});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['token'];
    navigate('/login');
  };

  const value = {
    products,
    currency,
    delivery_fee,
    formatPrice,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
    setCartItems,
    user,
    setUser,
    logout
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
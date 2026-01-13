import React, { useContext, useState } from 'react'
import Checkout from '../../components/Checkout'
import Title from '../../components/LatesCollection/Title'
import CartTotal from '../../components/CartTotal/CartTotal'
import { ShopContext } from '../../context/ShopContext/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const [showPaypal, setShowPaypal] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [showQR, setShowQR] = useState(false);
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, user } = useContext(ShopContext);

  // Nếu chưa đăng nhập, chuyển hướng sang trang đăng nhập
  React.useEffect(() => {
    if (!user || !user._id) {
      toast.error('Bạn cần đăng nhập để đặt hàng!');
      navigate('/login');
    }
  }, [user, navigate]);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    city: '',
    street: '',
    phone: ''

  })

  const onChangeHandler = (even) => {
    const name = even.target.name
    const value = even.target.value

    setFormData(data => ({ ...data, [name]: value }))
  }
  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      let orderItems = []
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items))
            if (itemInfo) {
              itemInfo.size = item
              itemInfo.quantity = cartItems[items][item]
              orderItems.push(itemInfo)
            }
          }
        }
      }
      console.log(orderItems);
      let orderData = {
        userId: user._id,
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee
      }
      console.log('user:', user);
      console.log('userId:', user._id);
      console.log('orderData:', orderData);
      switch (method) {
        case 'cod':
          const response = await axios.post(backendUrl+'/api/order/place',orderData,{headers:{token}})
          if (response.data.success) {
            setCartItems({})
            navigate('/orders')
          }else{
            toast.error(response.data.message)
          }
          break;
        default:
          break;
      }

    } catch (error) {
        console.log(error)
        toast.error(error.message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'THÔNG TIN'} text2={'GIAO HÀNG'} />
        </div>
        <input required onChange={onChangeHandler} name='fullname' value={formData.fullname} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Họ và tên' />
        <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Email' />
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Thành phố' />
          <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Số nhà,tên đường' />
        </div>
        <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Số điện thoại' />
      </div>
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>
        <div className='mt-12'>
          <Title text1={'PHƯƠNG THỨC'} text2={' THANH TOÁN'} />
        </div>
        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
          <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-500' : ''}`}></p>
          <p className='text-gray-500 text-sm font-medium mx-4'>Thanh toán khi nhận hàng</p>
        </div>
        <div className='w-full text-end mt-8 flex gap-4 justify-end'>
          <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>Đặt hàng</button>
          <button
            type='button'
            className='bg-blue-500 text-white px-8 py-3 text-sm ml-4'
            onClick={async () => {
              setOrderStatus('Đang thanh toán');
              let orderItems = [];
              for (const items in cartItems) {
                for (const item in cartItems[items]) {
                  if (cartItems[items][item] > 0) {
                    const itemInfo = structuredClone(products.find(product => product._id === items));
                    if (itemInfo) {
                      itemInfo.size = item;
                      itemInfo.quantity = cartItems[items][item];
                      orderItems.push(itemInfo);
                    }
                  }
                }
              }
              let orderData = {
                userId: user._id,
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_fee,
                status: 'Đang thanh toán',
                paymentMethod: 'PayPal',
                payment: false
              };
              try {
                await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
              } catch (err) {
                toast.error('Không thể tạo đơn hàng đang thanh toán!');
              }
              setShowPaypal(!showPaypal);
            }}
          >
            Thanh toán PayPal
          </button>
          <button
            type='button'
            className='bg-green-600 text-white px-8 py-3 text-sm ml-4'
            onClick={() => setShowQR(true)}
          >
            Quét mã QR
          </button>
        </div>
        {showQR && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowQR(false)}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', position: 'relative', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>Quét mã QR để chuyển khoản</p>
              <img src={require('../../assets/image/qr.jpg')} alt="QR chuyển khoản" style={{ maxWidth: 300, borderRadius: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                <button style={{ padding: '8px 24px', background: '#222', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }} onClick={() => setShowQR(false)}>Đóng</button>
                <button
                  style={{ padding: '8px 24px', background: '#16a34a', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  onClick={async () => {
                    // Tạo đơn hàng đã thanh toán bằng QR
                    let orderItems = [];
                    for (const items in cartItems) {
                      for (const item in cartItems[items]) {
                        if (cartItems[items][item] > 0) {
                          const itemInfo = structuredClone(products.find(product => product._id === items));
                          if (itemInfo) {
                            itemInfo.size = item;
                            itemInfo.quantity = cartItems[items][item];
                            orderItems.push(itemInfo);
                          }
                        }
                      }
                    }
                    let orderData = {
                      userId: user._id,
                      address: formData,
                      items: orderItems,
                      amount: getCartAmount() + delivery_fee,
                      status: 'Đã thanh toán',
                      paymentMethod: 'QR',
                      payment: true
                    };
                    try {
                      const res = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
                      if (res.data.success) {
                        setCartItems({});
                        toast.success('Đặt hàng thành công!');
                        setShowQR(false);
                        navigate('/orders');
                      } else {
                        toast.error(res.data.message || 'Lỗi đặt hàng!');
                      }
                    } catch (err) {
                      toast.error('Không thể tạo đơn hàng đã thanh toán!');
                    }
                  }}
                >
                  Đã thanh toán QR
                </button>
              </div>
            </div>
          </div>
        )}
        {orderStatus && (
          <div className='text-yellow-600 font-semibold mt-4'>Trạng thái đơn hàng: {orderStatus}</div>
        )}
        {showPaypal && (
          <div className='mt-6'>
            <Checkout total={getCartAmount() + delivery_fee} cartItems={Object.entries(cartItems).flatMap(([productId, sizes]) => Object.entries(sizes).map(([size, quantity]) => {
              const product = products.find(p => p._id === productId);
              return product ? { ...product, size, quantity } : null;
            })).filter(Boolean)} user={user} />
          </div>
        )}
      </div>

    </form>
  )
}

export default PlaceOrder

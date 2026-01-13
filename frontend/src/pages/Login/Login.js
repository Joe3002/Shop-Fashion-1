// ...existing code...
import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../../context/ShopContext/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
// Tích hợp Google Login: sử dụng thư viện @react-oauth/google để đăng nhập bằng tài khoản Google
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [currenState,setCurrenState] = useState('Đăng nhập')
  const { token, setToken, setUser, navigate, backendUrl } = useContext(ShopContext)

  console.log('POST to', backendUrl + '/api/auth/google')

  const [name,setName] = useState('')
  const [password,setPassword] = useState('')
  const [email,setEmail] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')

  const onSubmitHandler = async (e) =>{
    e.preventDefault();
    try {
      if (currenState === 'Đăng ký') {
        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password })
        if (response.data.success) {
          setToken(response.data.token)
          setUser(response.data.user || null)
          localStorage.setItem('token', response.data.token)
          if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user))
          toast.success('Đăng ký thành công')
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', { email, password })
        if (response.data.success) {
          setToken(response.data.token)
          setUser(response.data.user || null)
          localStorage.setItem('token', response.data.token)
          if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user))
          toast.success('Đăng nhập thành công')
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  useEffect(()=>{
    if (token) {
      navigate('/')
    }
  },[token, navigate])

  // Xử lý đăng nhập thành công với Google
  // Nhận credential (idToken) từ Google, gửi lên backend để xác thực và lấy thông tin user
  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) return console.error('No credential');

  // Giải mã idToken để lấy email (demo, thực tế nên gửi idToken lên backend để xác thực an toàn hơn)
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    const { email } = JSON.parse(jsonPayload);

    try {
  // Gửi email (hoặc idToken) lên backend để xác thực/tạo user và nhận JWT token
  const res = await axios.post(backendUrl + '/api/user/google-login', { email });
      if (res.data.success) {
        setToken(res.data.token);
        // Đảm bảo user có đủ trường _id, name, email, type
        const userFull = res.data.user && res.data.user._id ? res.data.user : {
          _id: res.data.user?._id || '',
          name: res.data.user?.name || '',
          email: res.data.user?.email || '',
          type: res.data.user?.type || 'loginGoogle'
        };
        setUser(userFull);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(userFull));
        toast.success('Đăng nhập bằng Google thành công');
        navigate('/profile');
      } else {
        console.error(res.data.message);
        toast.error(res.data.message || 'Google auth failed');
      }
    } catch (err) {
      console.error('Google login error', err);
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  const handleGoogleError = () => {
    console.error('Login Failed');
    toast.error('Google sign-in failed')
  }

  return (
    <>
      {showForgot ? (
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            const res = await axios.post(backendUrl + '/api/user/forgot-password', {
              email: forgotEmail,
              newPassword: forgotNewPassword
            });
            if (res.data.success) {
              toast.success('Đặt lại mật khẩu thành công!');
              setShowForgot(false);
              setForgotEmail('');
              setForgotNewPassword('');
            } else {
              toast.error(res.data.message);
            }
          } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
          }
        }} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
          <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-3xl'>Quên mật khẩu</p>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
          </div>
          <input onChange={e => setForgotEmail(e.target.value)} value={forgotEmail} className='w-full px-3 py-2 border border-gray-800' type='email' placeholder='Email' />
          <input onChange={e => setForgotNewPassword(e.target.value)} value={forgotNewPassword} className='w-full px-3 py-2 border border-gray-800' type='password' placeholder='Mật khẩu mới' />
          <div className='w-full flex justify-between text-sm mt-[-8px]'>
            <p onClick={() => setShowForgot(false)} className='cursor-pointer'>Quay lại đăng nhập</p>
          </div>
          <button type='submit' className='bg-black text-white font-light px-8 py-2 mt-4'>Đặt lại mật khẩu</button>
        </form>
      ) : (
        <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
          <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-3xl'>{currenState}</p>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
          </div>
          {currenState === 'Đăng nhập' ? '' : <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full px-3 py-2 border border-gray-800' type="text" placeholder='Tên đăng nhập'/>}
          <input onChange={(e)=>setEmail(e.target.value)} value={email} className='w-full px-3 py-2 border border-gray-800' type="email" placeholder='Email' />
          <input onChange={(e)=>setPassword(e.target.value)} value={password} className='w-full px-3 py-2 border border-gray-800' type="password" placeholder='Mật khẩu' />
          <div className='w-full flex justify-between text-sm mt-[-8px]'>
            <p className='cursor-pointer' onClick={() => setShowForgot(true)}>Quên mật khẩu?</p>
            {
              currenState === 'Đăng nhập'
              ? <p onClick={()=>setCurrenState('Đăng ký')} className='cursor-pointer'>Tạo tài khoản</p>
              : <p onClick={()=>setCurrenState('Đăng nhập')} className='cursor-pointer'>Đăng nhập tại đây</p>
            }
          </div>
          <div className='mt-2'>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
          <button type="submit" className='bg-black text-white font-light px-8 py-2 mt-4'>{currenState === 'Đăng nhập' ? 'Đăng nhập' :'Đăng ký'}</button>
        </form>
      )}
    </>
  )
}

export default Login
// ...existing code...
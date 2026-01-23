import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Edit from './pages/Edit'
import Login from './components/Login'
import AdminStats from './components/AdminStats.jsx'
import CategoryAdmin from './components/CategoryAdmin.jsx'
import ListUser from './pages/ListUser.jsx'
 import { ToastContainer } from 'react-toastify';
export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
export const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'')
  useEffect(()=>{
    localStorage.setItem('token',token)
  },[token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer/>
      {token === ""
        ? <Login setToken={setToken} />
        : <>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
               <Routes>
              <Route path='/' element={<AdminStats backendUrl={backendUrl} token={token} />} />
              <Route path='/add' element={<Add token={token} />} />
              <Route path='/list' element={<List token={token} />} />
              <Route path='/orders' element={<Orders token={token} />} />
              <Route path='/edit/:id' element={<Edit token={token} />} />
              <Route path='/stats' element={<AdminStats backendUrl={backendUrl} token={token} />} />
              <Route path='/category' element={<CategoryAdmin token={token} />} />
              <Route path='/users' element={<ListUser token={token} backendUrl={backendUrl} />} />
            </Routes>
            </div>
           
          </div>
        </>

      }


    </div>
  )
}

export default App

import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home/Home'
import Contacts from './pages/Contacts/Contacts'
import About from './pages/About/About'
import Collection from './pages/Collection/Collection'
import Product from './pages/Product/Product'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Order from './pages/Orders/Order'
import Login from './pages/Login/Login'
import Profile from './pages/Profile'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Search from './components/Search/Search'
import { ToastContainer} from 'react-toastify';
export const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
const App = () => {
  return (
    <div className='px-4 sm:px[5vw] md:px-[7vw] lg:px[9vw]'>
      <ToastContainer />
      <Navbar/>
      <Search/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/collection' element={<Collection/>} />
        <Route path='/about' element={<About/>} />
        <Route path='/contacts' element={<Contacts/>} />
        <Route path='/product/:productId' element={<Product/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/place-order' element={<PlaceOrder/>} />
        <Route path='/orders' element={<Order/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/profile' element={<Profile/>} />
      </Routes>
      <Footer/>
    </div>
  )
  
}

export default App

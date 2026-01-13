// ...existing code...
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom'
import ShopContextProvider from './context/ShopContext/ShopContext';
import { GoogleOAuthProvider } from '@react-oauth/google'

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '801031916713-svc7lvn31g6kkoe5k7mfgr1qjm863krs.apps.googleusercontent.com';
console.log('Google clientId=', clientId); // xem giá trị tại console

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={clientId}>
    <BrowserRouter>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);

reportWebVitals();
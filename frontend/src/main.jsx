import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // 1. Thêm dòng này
import { CartProvider } from './context/CartContext'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* 2. Bao bọc App lại */}
      <CartProvider> {/* <--- 2. Bao bọc App lại bằng CartProvider */}
        <App />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)

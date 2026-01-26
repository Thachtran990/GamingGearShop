import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register'; // <-- 1. Import trang Register
import Login from './pages/Login'; // <--- 1. Import trang Login
import Header from './components/Header'; // <--- 1. Import Header
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import AdminProductList from './pages/AdminProductList';
import ProductAdd from './pages/ProductAdd';
import AdminOrderList from './pages/AdminOrderList';
import ProductEdit from './pages/ProductEdit';
function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header /> {/* <--- 2. Đặt Header ở đây, nó sẽ hiện ở mọi trang */}
      {/* Sau này thanh Menu (Navigation) sẽ nằm ở đây */}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} /> {/* <-- 2. Thêm dòng này */}
        <Route path="/login" element={<Login />} /> {/* <--- 2. Thêm dòng này */}
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/admin/productlist" element={<AdminProductList />} />
        <Route path="/admin/productadd" element={<ProductAdd />} />
        <Route path="/admin/orderlist" element={<AdminOrderList />} />
        <Route path="/admin/product/:id/edit" element={<ProductEdit />} />
      </Routes>
    </div>
  );
}

export default App;
import { Routes, Route, Navigate } from 'react-router-dom'; // 1. Import Navigate
import PrivateRoute from './components/PrivateRoute'; // 1. Import cái này
import Header from './components/Header';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import AdminProductList from './pages/AdminProductList';
import ProductAdd from './pages/ProductAdd';
import ProductEdit from './pages/ProductEdit';
import AdminOrderList from './pages/AdminOrderList';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Shipping from './pages/Shipping';
import PlaceOrder from './pages/PlaceOrder';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminRoute from './components/AdminRoute'; // Import vào
import AdminReviewList from "./pages/AdminReviewList";
// Import vào
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ShopPage from "./pages/ShopPage"; //trang danh mục sp theo bộ lọc
// Import file vừa tạo
import AdminCouponList from "./pages/admin/AdminCouponList";

// 1. Import CSS và Container
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const navigate = useNavigate();
    useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    
    // Nếu có token nhưng token quá cũ (cần decode để check date - nâng cao)
    // Cách đơn giản: Nếu gọi API mà bị lỗi 401 (như mấy lần trước bạn gặp),
    // ta nên có cơ chế tự logout.
    
    // Hiện tại để đơn giản, bạn có thể bỏ qua bước này. 
    // Nhưng hãy nhớ: Khi gặp lỗi 401 Unauthorized -> Code Frontend nên tự động xóa localStorage và đá về Login.
  }, []);
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />

        <Route path="/shipping" element={<Shipping />} />
        <Route path="/order/:id" element={<OrderDetail />} /> 
        <Route path="/placeorder" element={<PlaceOrder />} />
        
        {/* mới */}
        <Route path="/shop" element={<ShopPage />} />
        
        <Route path="" element={<PrivateRoute />}>
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        
        {/* Admin Routes */}
        {/* 👇 2. DÒNG FIX LỖI: Tự động chuyển hướng /admin -> /admin/orderlist */}
        <Route path="" element={<AdminRoute />}>
          <Route path="/admin" element={<Navigate to="/admin/orderlist" replace />} />
          <Route path="/admin/productlist" element={<AdminProductList />} />
          <Route path="/admin/productlist/:pageNumber" element={<AdminProductList />} />
          <Route path="/admin/productadd" element={<ProductAdd />} />
          <Route path="/admin/product/:id/edit" element={<ProductEdit />} />
          <Route path="/admin/orderlist" element={<AdminOrderList />} />
          {/* 👇 THÊM DÒNG NÀY VÀO ĐÂY */}
          <Route path="/admin/reviews" element={<AdminReviewList />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* 👈 Thêm dòng này */}
          <Route path="/admin/coupons" element={<AdminCouponList />} /> {/* 👈 THÊM DÒNG NÀY */}
        </Route>
      </Routes>
    </div>
  );

  <ToastContainer />
}

export default App;
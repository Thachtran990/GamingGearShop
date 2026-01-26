import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Header = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  
  // 1. Lấy thông tin người dùng
  const user = JSON.parse(localStorage.getItem("userInfo"));

  // 2. Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    alert("Đã đăng xuất thành công!");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* --- LOGO --- */}
        <Link to="/" className="text-2xl font-bold text-yellow-400 hover:text-yellow-300">
          🎮 GEAR SHOP
        </Link>

        {/* --- MENU BÊN PHẢI --- */}
        <div className="space-x-6 flex items-center">
          <Link to="/" className="hover:text-gray-300">Trang chủ</Link>

          {/* Nút Giỏ hàng */}
          <Link to="/cart" className="relative hover:text-gray-300">
            Giỏ hàng
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {cartItems.length}
              </span>
            )}
          </Link>
          
          {/* --- KHU VỰC NGƯỜI DÙNG --- */}
          {user ? (
            <div className="flex items-center gap-4">
              
              {/* MENU RIÊNG CHO ADMIN (Chỉ hiện khi user.isAdmin = true) */}
              {user.isAdmin && (
                <div className="flex gap-2 mr-2 border-r border-gray-600 pr-4">
                  <Link 
                    to="/admin/productlist" 
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded border border-gray-500 text-red-300 font-bold"
                  >
                    QL Sản Phẩm
                  </Link>
                  <Link 
                    to="/admin/orderlist" 
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded border border-gray-500 text-red-300 font-bold"
                  >
                    QL Đơn Hàng
                  </Link>
                </div>
              )}

              {/* MENU KHÁCH HÀNG */}
              <Link to="/myorders" className="text-yellow-400 hover:text-yellow-300 font-semibold underline text-sm">
                Đơn hàng của tôi
              </Link>

              <span className="text-green-400 font-semibold">
                Xin chào, {user.username}
              </span>

              <button 
                onClick={handleLogout}
                className="bg-red-600 px-4 py-1 rounded hover:bg-red-700 transition text-sm"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            /* --- NÚT ĐĂNG NHẬP / ĐĂNG KÝ (Khi chưa login) --- */
            <>
              <Link to="/login" className="hover:text-gray-300">Đăng nhập</Link>
              <Link 
                to="/register" 
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
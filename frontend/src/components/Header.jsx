import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import SearchBox from "./SearchBox";

const Header = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("cartItems"); 
    alert("Đã đăng xuất thành công!");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* --- LOGO --- */}
        <Link to="/" className="text-2xl font-bold text-yellow-400 hover:text-yellow-300">
          🎮 GEAR SHOP
        </Link>

        {/* THANH TÌM KIẾM */}
        <div className="hidden md:block w-1/3"> 
          <SearchBox />
        </div>

        {/* --- MENU BÊN PHẢI --- */}
        <div className="space-x-6 flex items-center">
          <Link to="/" className="hover:text-gray-300 hidden md:inline">Trang chủ</Link>

          {/* Nút Giỏ hàng */}
          <Link to="/cart" className="relative hover:text-gray-300 group">
             <span className="text-2xl">🛒</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>
          
          {/* --- KHU VỰC NGƯỜI DÙNG --- */}
          {userInfo ? (
            <div className="flex items-center gap-4">
              
              {/* MENU ADMIN */}
              {userInfo.isAdmin && (
                <div className="hidden lg:flex gap-2 mr-2 border-r border-gray-600 pr-4">
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
                  
                  {/* 👇 NÚT MỚI THÊM VÀO ĐÂY 👇 */}
                  <Link 
                    to="/admin/reviews" 
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded border border-gray-500 text-yellow-300 font-bold"
                  >
                    QL Đánh giá
                  </Link>
                  {/* 👆 KẾT THÚC NÚT MỚI 👆 */}

                </div>
              )}

              {/* 👇 DROPDOWN MENU USER 👇 */}
              <div className="group relative z-50">
                <div className="flex items-center gap-2 cursor-pointer pb-2"> 
                    <span className="text-green-400 font-semibold group-hover:text-green-300 transition-colors">
                        Chào, {userInfo.name} ▼
                    </span>
                </div>
                
                <div className="absolute right-0 top-full w-56 hidden group-hover:block pt-1">
                    <div className="bg-white text-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-200">
                        
                        <div className="px-4 py-3 border-b bg-gray-50">
                            <p className="text-sm">Đăng nhập là:</p>
                            <p className="text-sm font-bold truncate text-blue-600">{userInfo.email}</p>
                        </div>

                        <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 transition">
                             👤 Hồ sơ cá nhân
                        </Link>
                        <Link to="/myorders" className="block px-4 py-2 hover:bg-gray-100 transition">
                             📦 Đơn hàng của tôi
                        </Link>
                        
                        <div className="border-t border-gray-100"></div>
                        
                        <button 
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:font-bold transition"
                        >
                            🚪 Đăng xuất
                        </button>
                    </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="hover:text-gray-300 py-2">Đăng nhập</Link>
              <Link 
                to="/register" 
                className="bg-yellow-500 text-slate-900 font-bold px-4 py-2 rounded hover:bg-yellow-400 transition"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Header = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [keyword, setKeyword] = useState("");

  // Kiểm tra an toàn để tránh lỗi nếu localStorage rỗng
  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

  // 👇 HÀM XỬ LÝ TÌM KIẾM
  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      // Chuyển hướng sang trang Shop kèm từ khóa
      navigate(`/shop?keyword=${keyword}`);
    } else {
      navigate("/shop");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("cartItems");
    alert("Đã đăng xuất thành công!");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4">

        {/* --- LOGO --- */}
        <Link to="/" className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 flex-shrink-0">
          🎮 GEAR SHOP
        </Link>

        {/* --- THANH TÌM KIẾM (Đã chỉnh ngắn lại) --- */}
        {/* max-w-[250px]: Giới hạn chiều rộng tối đa là 250px */}
        <form onSubmit={submitHandler} className="hidden md:flex flex-1 max-w-[250px] mx-6">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full px-3 py-1.5 text-black rounded-l-md focus:outline-none text-sm"
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-yellow-400 text-black px-3 py-1.5 rounded-r-md font-bold hover:bg-yellow-500 text-sm"
          >
            Tìm
          </button>
        </form>

        {/* --- MENU BÊN PHẢI --- */}
        <div className="space-x-4 flex items-center">
          <Link to="/" className="hover:text-gray-300 hidden md:inline font-medium">Trang chủ</Link>

          <Link to="/shop" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium hidden lg:inline">
            Cửa Hàng
          </Link>

          {/* Nút Giỏ hàng */}
          <Link to="/cart" className="relative hover:text-gray-300 group mr-2">
            <span className="text-2xl">🛒</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* --- KHU VỰC NGƯỜI DÙNG --- */}
          {userInfo ? (
            <div className="flex items-center gap-3">

              {/* DASHBOARD & ADMIN MENU */}
              {userInfo.isAdmin && (
                <div className="hidden xl:flex items-center gap-2 border-r border-gray-600 pr-3">
                  {/* Nút Thống kê */}
                  <Link
                    to="/admin/dashboard"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1"
                  >
                    📊 Thống kê
                  </Link>

                  <Link
                    to="/admin/productlist"
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded border border-gray-500 text-red-300 font-bold"
                  >
                    QL SP
                  </Link>
                  <Link
                    to="/admin/orderlist"
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded border border-gray-500 text-red-300 font-bold"
                  >
                    QL Đơn
                  </Link>
                  <Link
                    to="/admin/reviews"
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded border border-gray-500 text-yellow-300 font-bold"
                  >
                    QL Đánh giá
                  </Link>

                  <Link
                    to="/admin/coupons"
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded border border-gray-500 text-green-300 font-bold"
                  >
                    🎫 QL Coupon
                  </Link>
                </div>
              )}

              {/* DROPDOWN MENU USER */}
              <div className="group relative z-50">
                <div className="flex items-center gap-2 cursor-pointer pb-1">
                  <span className="text-green-400 font-semibold group-hover:text-green-300 transition-colors text-sm">
                    Chào, {userInfo.name} ▼
                  </span>
                </div>

                <div className="absolute right-0 top-full w-56 hidden group-hover:block pt-1">
                  <div className="bg-white text-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-200">
                    <div className="px-4 py-3 border-b bg-gray-50">
                      <p className="text-xs text-gray-500">Đăng nhập là:</p>
                      <p className="text-sm font-bold truncate text-blue-600">{userInfo.email}</p>
                    </div>

                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 transition text-sm">
                      👤 Hồ sơ cá nhân
                    </Link>
                    <Link to="/myorders" className="block px-4 py-2 hover:bg-gray-100 transition text-sm">
                      📦 Đơn hàng của tôi
                    </Link>

                    {/* Menu Admin Mobile (Hiện khi màn hình nhỏ) */}
                    {userInfo.isAdmin && (
                      <div className="xl:hidden border-t border-gray-100">
                        <p className="px-4 py-1 text-xs text-gray-400 font-bold uppercase mt-1">Quản trị viên</p>
                        <Link to="/admin/dashboard" className="block px-4 py-2 hover:bg-purple-50 text-purple-700 text-sm">📊 Thống kê</Link>
                        <Link to="/admin/productlist" className="block px-4 py-2 hover:bg-gray-100 text-sm">🔧 QL Sản phẩm</Link>
                        <Link to="/admin/orderlist" className="block px-4 py-2 hover:bg-gray-100 text-sm">📦 QL Đơn hàng</Link>
                      </div>
                    )}

                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:font-bold transition text-sm"
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="hover:text-gray-300 py-2 px-2 font-medium">Đăng nhập</Link>
              <Link
                to="/register"
                className="bg-yellow-500 text-slate-900 font-bold px-3 py-2 rounded hover:bg-yellow-400 transition"
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
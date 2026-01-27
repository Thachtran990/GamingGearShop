import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Shipping = () => {
  const { shippingAddress, saveShippingAddress, cartItems } = useCart();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo")); // Kiểm tra xem có đăng nhập ko

  // Nếu giỏ hàng rỗng -> về cart
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  // State
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [phone, setPhone] = useState(shippingAddress.phone || "");
  const [country, setCountry] = useState(shippingAddress.country || "Việt Nam");
  
  // 👇 THÊM: State cho Tên và Email (Chỉ dùng nếu là Guest)
  const [guestName, setGuestName] = useState(shippingAddress.guestName || "");
  const [guestEmail, setGuestEmail] = useState(shippingAddress.guestEmail || "");

  const submitHandler = (e) => {
    e.preventDefault();
    
    // Lưu tất cả vào context (bao gồm cả tên/email guest nếu có)
    saveShippingAddress({ 
        address, city, phone, country,
        guestName: !userInfo ? guestName : null, // Nếu chưa login thì lưu tên khách
        guestEmail: !userInfo ? guestEmail : null 
    });
    
    navigate("/placeorder");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={submitHandler} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">THÔNG TIN GIAO HÀNG</h2>

        {/* 👇 KHU VỰC NHẬP TÊN/EMAIL CHO KHÁCH VÃNG LAI (Chỉ hiện khi chưa Login) */}
        {!userInfo && (
            <div className="bg-yellow-50 p-4 mb-4 rounded border border-yellow-200">
                <p className="text-sm text-yellow-800 mb-2 font-bold">Mua hàng không cần tài khoản</p>
                <div className="mb-3">
                    <label className="block text-gray-700 text-sm mb-1">Họ và tên</label>
                    <input 
                        type="text" required 
                        value={guestName} onChange={(e) => setGuestName(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm mb-1">Email (để nhận tin đơn hàng)</label>
                    <input 
                        type="email" required 
                        value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
            </div>
        )}

        {/* Các ô nhập Địa chỉ cũ giữ nguyên */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Số điện thoại (Bắt buộc)</label>
          <input
            type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Địa chỉ nhận hàng</label>
          <input
            type="text" required value={address} onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Thành phố / Tỉnh</label>
          <input
            type="text" required value={city} onChange={(e) => setCity(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Quốc gia</label>
          <input
            type="text" required value={country} onChange={(e) => setCountry(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">
          TIẾP TỤC
        </button>
      </form>
    </div>
  );
};

export default Shipping;
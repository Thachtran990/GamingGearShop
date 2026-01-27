import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cartItems, removeFromCart } = useCart();
  const navigate = useNavigate(); // Dùng để chuyển trang

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  // --- HÀM XỬ LÝ ĐẶT HÀNG MỚI ---
  const handleCheckout = async () => {
    // 1. Kiểm tra xem đã đăng nhập chưa
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      alert("Bạn cần đăng nhập để thanh toán!");
      navigate("/login");
      return;
    }

    // 2. Chuẩn bị dữ liệu gửi về Backend
    const orderData = {
      userId: userInfo._id,
      orderItems: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty
      })),
      totalPrice: totalPrice
    };

    try {
      // 3. Gọi API tạo đơn hàng
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        alert("Đặt hàng thành công! Cảm ơn bạn đã ủng hộ.");
        localStorage.removeItem("cartItems"); // Xóa giỏ hàng sau khi mua
        window.location.href = "/"; // Quay về trang chủ (hoặc trang lịch sử đơn hàng nếu có)
      } else {
        alert("Đặt hàng thất bại, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Có lỗi xảy ra.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h2>
        <Link to="/" className="text-blue-600 hover:underline">
          Quay lại mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">GIỎ HÀNG CỦA BẠN</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="flex items-center bg-white p-4 rounded-lg shadow-sm">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded mr-4" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-500">{item.price.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="flex items-center">
                <span className="font-bold mx-4">x{item.qty}</span>
                <button 
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg h-fit">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Cộng giỏ hàng</h2>
          <div className="flex justify-between mb-2">
            <span>Số lượng:</span>
            <span>{cartItems.reduce((acc, item) => acc + item.qty, 0)} sản phẩm</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-red-600 mb-6">
            <span>Tổng cộng:</span>
            <span>{totalPrice.toLocaleString('vi-VN')} đ</span>
          </div>
          
          {/* Nút thanh toán đã gắn hàm handleCheckout */}
          <button 
            // Thay vì gọi hàm API cũ, giờ chỉ cần chuyển trang
            onClick={() => navigate("/shipping")} 
            className="w-full bg-black text-white py-3 rounded mt-6 hover:bg-gray-800"
          >
            TIẾN HÀNH ĐẶT HÀNG
        </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
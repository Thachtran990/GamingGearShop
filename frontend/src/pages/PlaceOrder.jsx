import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { cartItems, shippingAddress, clearCart } = useCart();

  // Tính toán tiền nong
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 1000000 ? 0 : 30000; 
  const totalPrice = itemsPrice + shippingPrice;

  // Nếu giỏ hàng rỗng thì đá về trang chủ
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const placeOrderHandler = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      // 1. Cấu hình Header
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }

      // 2. Gửi đơn hàng
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
          
          // 👇 SỬA QUAN TRỌNG Ở ĐÂY: Gửi thêm variantId
          orderItems: cartItems.map((item) => ({
             name: item.name,
             qty: item.qty,
             image: item.image,
             price: item.price,
             product: item._id, // ID sản phẩm gốc
             variantId: item.variantId // <--- THÊM DÒNG NÀY ĐỂ TRỪ KHO ĐÚNG
          })),

          shippingAddress: shippingAddress,
          paymentMethod: "Thanh toán khi nhận hàng (COD)",
          itemsPrice,
          shippingPrice,
          totalPrice,
          guestName: shippingAddress.guestName,
          guestEmail: shippingAddress.guestEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Xóa giỏ hàng sau khi đặt thành công
        clearCart(); 
        navigate(`/order/${data._id}`);
      } else {
        alert(data.message || "Đặt hàng thất bại");
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
       {/* Bước tiến trình (Breadcrumb) */}
       <div className="flex justify-center mb-8 text-sm font-bold text-gray-500">
        <span className="text-green-600">ĐĂNG NHẬP</span> <span className="mx-2">{'>'}</span>
        <span className="text-green-600">VẬN CHUYỂN</span> <span className="mx-2">{'>'}</span>
        <span className="text-black border-b-2 border-black">ĐẶT HÀNG</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THÔNG TIN */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 1. GIAO TỚI */}
          <div className="bg-white p-6 rounded shadow-sm border">
            <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">GIAO TỚI</h2>
            <p className="text-lg font-semibold">
                {shippingAddress.guestName && <span className="text-blue-600">{shippingAddress.guestName} | </span>}
                {shippingAddress.address}, {shippingAddress.city}
            </p>
            <p className="text-gray-600 mt-1">SĐT: {shippingAddress.phone}</p>
            {shippingAddress.guestEmail && <p className="text-gray-500 text-sm">Email: {shippingAddress.guestEmail}</p>}
          </div>

          {/* 2. SẢN PHẨM */}
          <div className="bg-white p-6 rounded shadow-sm border">
            <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">SẢN PHẨM</h2>
            {cartItems.length === 0 ? (
              <p>Giỏ hàng trống</p>
            ) : (
              <ul>
                {cartItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center py-4 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border" />
                      <div>
                        <Link to={`/product/${item.product}`} className="text-blue-600 hover:underline font-medium block">
                          {item.name}
                        </Link>
                        {/* Hiển thị thuộc tính biến thể nếu có (VD: Màu Đen) */}
                        {item.variantId && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Phân loại hàng: {item.name.split('(')[1]?.replace(')', '') || 'Biến thể'}</span>}
                      </div>
                    </div>
                    <div className="text-gray-600">
                      {item.qty} x {item.price.toLocaleString('vi-VN')} đ = <span className="font-bold text-black">{(item.qty * item.price).toLocaleString('vi-VN')} đ</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: TỔNG KẾT */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded shadow-lg border border-gray-200 sticky top-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">TỔNG CỘNG</h2>
            
            <div className="flex justify-between mb-2 text-gray-600">
              <span>Tiền hàng:</span>
              <span>{itemsPrice.toLocaleString('vi-VN')} đ</span>
            </div>
            
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Phí Ship:</span>
              <span>{shippingPrice.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="border-t pt-4 flex justify-between mb-6 text-xl font-bold text-red-600">
              <span>Thành tiền:</span>
              <span>{totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>

            <button 
              onClick={placeOrderHandler}
              className="w-full bg-black text-white py-3 rounded font-bold hover:bg-gray-800 transition transform hover:scale-105"
            >
              XÁC NHẬN ĐẶT HÀNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const { cartItems, removeFromCart, updateCartItemQty } = useCart();
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  // 👇 HÀM XỬ LÝ THANH TOÁN MỚI
  const checkoutHandler = () => {
    // Kiểm tra xem đã đăng nhập chưa?
    const userInfo = localStorage.getItem("userInfo");
    
    if (userInfo) {
        // Nếu rồi -> Đi thẳng đến trang điền địa chỉ
        navigate("/shipping");
    } else {
        // Nếu chưa -> Về trang đăng nhập, đăng nhập xong tự nhảy sang shipping
        navigate("/login?redirect=/shipping");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 uppercase text-center">Giỏ hàng của bạn</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600 mb-4">Giỏ hàng đang trống trơn...</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">
            ĐI MUA SẮM NGAY
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                {/* Ảnh */}
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded border" />
                
                {/* Thông tin */}
                <div className="flex-1 text-center sm:text-left">
                  <Link to={`/product/${item.product}`} className="text-lg font-bold text-blue-700 hover:underline">
                    {item.name.split('(')[0]}
                  </Link>
                  {/* Hiển thị phân loại hàng nếu có */}
                  {item.variantId && (
                     <p className="text-sm text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded mt-1">
                        Phân loại: {item.name.match(/\(([^)]+)\)/)?.[1] || "Biến thể"}
                     </p>
                  )}
                  <p className="text-red-600 font-bold mt-1">{item.price.toLocaleString('vi-VN')} đ</p>
                </div>

                {/* Bộ chỉnh số lượng */}
                <div className="flex flex-col items-center">
                    <label className="text-xs font-bold text-gray-500 mb-1">Số lượng</label>
                    <select 
                        value={item.qty}
                        onChange={(e) => updateCartItemQty(item._id, item.variantId, Number(e.target.value))}
                        className="p-2 border rounded w-20 text-center font-bold bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        {/* Tạo option từ 1 đến Tồn kho của item đó */}
                        {[...Array(item.countInStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                                {x + 1}
                            </option>
                        ))}
                    </select>
                    <span className="text-xs text-gray-400 mt-1">Kho: {item.countInStock}</span>
                </div>

                {/* Nút xóa */}
                <button 
                  onClick={() => removeFromCart(item._id, item.variantId)}
                  className="text-red-500 hover:text-red-700 font-bold p-2"
                  title="Xóa khỏi giỏ"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* CỘT PHẢI: TỔNG KẾT & THANH TOÁN */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg border sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">CỘNG GIỎ HÀNG</h2>
              
              <div className="flex justify-between mb-2 text-lg">
                <span>Tổng số lượng:</span>
                <span className="font-bold">{totalItems}</span>
              </div>
              
              <div className="flex justify-between mb-6 text-2xl font-bold text-red-600">
                <span>Tạm tính:</span>
                <span>{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>

              <button 
                onClick={checkoutHandler} // Nếu chưa login thì login xong qua shipping
                className="w-full bg-black text-white py-4 rounded font-bold hover:bg-gray-800 transition transform hover:scale-[1.02] shadow-md"
              >
                TIẾN HÀNH THANH TOÁN
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CartPage;
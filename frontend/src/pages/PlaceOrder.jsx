import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; // 👈 Dùng Context cũ của bạn
import axios from "axios";
import { toast } from "react-toastify";
import { FaTicketAlt } from "react-icons/fa";

// Nếu bạn chưa tạo các component này thì comment lại hoặc xóa đi
import CheckoutSteps from "../components/CheckoutSteps"; 
//import Message from "../components/Message";

const PlaceOrder = () => {
  const navigate = useNavigate();
  
  // 1. LẤY DỮ LIỆU TỪ CART CONTEXT (KHÔNG DÙNG REDUX)
  const { cartItems } = useCart(); 
  
  // Lấy thông tin user và địa chỉ từ LocalStorage (Vì Context thường chỉ lưu items)
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const savedShippingAddress = JSON.parse(localStorage.getItem("shippingAddress")) || {};
  const savedPaymentMethod = JSON.parse(localStorage.getItem("paymentMethod")) || "COD";

  // State cho đơn hàng
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. TÍNH TOÁN TIỀN NONG (Tính trực tiếp tại đây)
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * (item.qty || item.quantity || 1), 0);
  const shippingPrice = itemsPrice > 1000000 ? 0 : 30000; // Ví dụ: >1tr Freeship
  const taxPrice = Number((0.1 * itemsPrice).toFixed(0)); // Thuế 10%
  const originalTotal = itemsPrice + shippingPrice + taxPrice; // Tổng chưa giảm

  // Redirect nếu chưa có địa chỉ
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else if (!savedShippingAddress.address) {
      navigate("/shipping");
    }
  }, [userInfo, savedShippingAddress, navigate]);

  // 3. HÀM CHECK COUPON (Giữ nguyên logic cũ dùng Axios)
  const applyCouponHandler = async () => {
    if (!couponCode.trim()) return;
    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.post(
            "/api/coupons/apply", 
            { couponCode, orderTotal: originalTotal }, 
            config
        );
        setDiscountAmount(data.discountAmount);
        setAppliedCoupon(data.code);
        toast.success(`Áp dụng mã ${data.code} giảm ${data.discountAmount.toLocaleString()}đ`);
    } catch (err) {
        setDiscountAmount(0);
        setAppliedCoupon(null);
        toast.error(err.response?.data?.message || "Mã không hợp lệ");
    }
  };

  // 4. HÀM ĐẶT HÀNG (Dùng Axios gọi thẳng API Order)
  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      // Chuẩn bị dữ liệu gửi lên Server
      const orderData = {
        orderItems: cartItems,
        shippingAddress: savedShippingAddress,
        paymentMethod: savedPaymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice: originalTotal - discountAmount, // Tổng tiền sau khi trừ mã
        couponCode: appliedCoupon,
        discountAmount: discountAmount
      };

      const { data } = await axios.post("/api/orders", orderData, config);

      // Xóa giỏ hàng sau khi đặt thành công (Gọi hàm từ Context hoặc xóa LocalStorage thủ công)
      localStorage.removeItem("cartItems"); 
      // Nếu useCart có hàm clearCart thì gọi ở đây: clearCart();

      toast.success("Đặt hàng thành công!");
      navigate(`/order/${data._id}`);
      
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Component CheckoutSteps nếu chưa có thì xóa dòng này đi */}
      <CheckoutSteps step1 step2 step3 step4 />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THÔNG TIN */}
        <div className="md:col-span-2">
          <div className="bg-white p-4 shadow rounded mb-4">
            <h2 className="text-xl font-bold mb-2">Vận chuyển</h2>
            <p><strong>Địa chỉ: </strong>
              {savedShippingAddress.address}, {savedShippingAddress.city}
            </p>
          </div>

          <div className="bg-white p-4 shadow rounded mb-4">
            <h2 className="text-xl font-bold mb-2">Sản phẩm</h2>
            {cartItems.length === 0 ? (
              <Message>Giỏ hàng trống</Message>
            ) : (
              <ul className="divide-y">
                {cartItems.map((item, index) => (
                  <li key={index} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <Link to={`/product/${item.product}`} className="font-bold text-gray-800 hover:text-blue-600">
                        {item.name}
                      </Link>
                    </div>
                    <div className="text-gray-600">
                      {/* Xử lý qty hoặc quantity tùy data của bạn */}
                      {item.qty || item.quantity} x {item.price.toLocaleString()}đ = <b>{((item.qty || item.quantity) * item.price).toLocaleString()}đ</b>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: TỔNG TIỀN & MÃ GIẢM GIÁ */}
        <div>
          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Tổng đơn hàng</h2>
            
            <div className="flex justify-between py-2 text-sm">
              <span>Tạm tính:</span><span>{itemsPrice.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span>Phí vận chuyển:</span><span>{shippingPrice.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span>Thuế (10%):</span><span>{taxPrice.toLocaleString()}đ</span>
            </div>

            {/* HIỂN THỊ GIẢM GIÁ */}
            {discountAmount > 0 && (
                <div className="flex justify-between py-2 text-green-600 font-bold text-sm border-t border-dashed">
                    <span className="flex items-center gap-1"><FaTicketAlt /> Mã giảm giá ({appliedCoupon}):</span>
                    <span>-{discountAmount.toLocaleString()}đ</span>
                </div>
            )}

            <div className="flex justify-between py-2 text-xl font-bold border-t mt-2 text-red-600">
              <span>Tổng cộng:</span>
              <span>{(originalTotal - discountAmount).toLocaleString()}đ</span>
            </div>

            {/* FORM NHẬP MÃ */}
            <div className="mt-4 p-3 bg-gray-50 rounded border border-dashed border-gray-300">
                <label className="text-xs font-bold text-gray-500 mb-1 block">Mã ưu đãi / Coupon</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Nhập mã..." 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full p-2 border rounded text-sm uppercase font-bold"
                        disabled={appliedCoupon !== null}
                    />
                    {appliedCoupon ? (
                        <button 
                            onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); setCouponCode(""); }}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 rounded text-sm font-bold"
                        >X</button>
                    ) : (
                        <button 
                            onClick={applyCouponHandler}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 rounded text-sm font-bold whitespace-nowrap"
                        >Áp dụng</button>
                    )}
                </div>
            </div>

            <div className="border-t mt-4 pt-4">
                <button
                type="button"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded text-lg shadow-lg disabled:opacity-50"
                disabled={cartItems.length === 0 || loading}
                onClick={placeOrderHandler}
                >
                {loading ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG NGAY"}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
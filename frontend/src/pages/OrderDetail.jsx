import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState("");

  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const headers = { "Content-Type": "application/json" };
        if (userInfo && userInfo.token) {
          headers.Authorization = `Bearer ${userInfo.token}`;
        }
        const res = await fetch(`/api/orders/${id}`, { headers });
        if (!res.ok) throw new Error("Lỗi tải đơn hàng");
        const data = await res.json();
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    const getPayPalClientId = async () => {
      try {
        const res = await fetch("/api/config/paypal");
        const data = await res.text();
        if (data.includes("<!DOCTYPE html>") || data.includes("<html")) {
             return;
        }
        setClientId(data);
      } catch (err) {
        console.error("Không lấy được PayPal ID");
      }
    };

    if (!order) {
      fetchOrder();
      getPayPalClientId();
    }
  }, [order, id, userInfo]);

  const deliverHandler = async () => {
    if (!userInfo || !userInfo.token) return; 
    try {
      const res = await fetch(`/api/orders/${id}/deliver`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      if (res.ok) {
        alert("Đã cập nhật trạng thái giao hàng!");
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onApprove = async (data, actions) => {
    return actions.order.capture().then(async function (details) {
      try {
        const headers = { "Content-Type": "application/json" };
        if (userInfo && userInfo.token) headers.Authorization = `Bearer ${userInfo.token}`;

        const res = await fetch(`/api/orders/${id}/pay`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(details),
        });
        if (res.ok) {
          alert("Thanh toán thành công! 💰");
          window.location.reload();
        }
      } catch (error) {
        console.error(error);
        alert("Lỗi thanh toán");
      }
    });
  };

  // 👇 HÀM MỚI: Helper chọn màu sắc dựa trên trạng thái
  const getStatusColor = (status) => {
      switch (status) {
          case "Đã giao hàng": return "bg-green-100 text-green-700";
          case "Đang giao hàng": return "bg-blue-100 text-blue-700";
          case "Đã hủy": return "bg-red-100 text-red-700";
          default: return "bg-yellow-100 text-yellow-700"; // Chờ xử lý
      }
  };

  if (loading) return <div className="text-center mt-10">Đang tải...</div>;
  if (!order) return <div className="text-center mt-10 text-red-500">Không tìm thấy đơn hàng</div>;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-gray-800">ĐƠN HÀNG: <span className="text-blue-600">{order._id}</span></h1>
         <Link to="/" className="text-blue-500 hover:underline">Quay về trang chủ</Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CỘT TRÁI */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-white p-6 rounded shadow-md border">
            <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">THÔNG TIN NHẬN HÀNG</h2>
            <p className="mb-2"><strong>Người nhận:</strong> {order.guestInfo?.name || order.user?.name || "Khách"}</p>
            <p className="mb-2"><strong>Email:</strong> <a href={`mailto:${order.guestInfo?.email || order.user?.email}`} className="text-blue-600">{order.guestInfo?.email || order.user?.email}</a></p>
            <p className="mb-2"><strong>Địa chỉ:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
            <p className="mb-4"><strong>Số điện thoại:</strong> {order.shippingAddress?.phone}</p>
            
            {/* 👇 CẬP NHẬT PHẦN HIỂN THỊ TRẠNG THÁI Ở ĐÂY */}
            <div className="flex gap-4">
                 <div className={`px-4 py-2 rounded font-bold ${getStatusColor(order.status)}`}>
                    {/* Ưu tiên hiện status text, nếu không có thì fallback về logic cũ */}
                    🚚 {order.status || (order.isDelivered ? "Đã giao hàng" : "Chờ xử lý")}
                 </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-md border">
            <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">SẢN PHẨM ĐÃ MUA</h2>
             <ul className="divide-y">
                {order.orderItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center py-3">
                      <div className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border"/>
                        <span className="font-medium text-gray-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{item.qty} x {item.price.toLocaleString('vi-VN')} đ</p>
                        <p className="font-bold text-gray-900">{(item.qty * item.price).toLocaleString('vi-VN')} đ</p>
                      </div>
                  </li>
                ))}
             </ul>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-center border-b pb-2">THANH TOÁN</h2>
            
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                    <span>Tiền hàng:</span>
                    <span>{order.itemsPrice?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Phí Ship:</span>
                    <span>{order.shippingPrice?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-red-600 pt-3 border-t">
                    <span>Tổng cộng:</span>
                    <span>{order.totalPrice?.toLocaleString('vi-VN')} đ</span>
                </div>
            </div>

            {/* TRẠNG THÁI THANH TOÁN */}
            <div className="mb-6 text-center">
                {order.isPaid ? (
                    <div className="bg-green-500 text-white py-2 rounded shadow">
                        ĐÃ THANH TOÁN ONLINE <br/>
                        <span className="text-sm">{new Date(order.paidAt).toLocaleString('vi-VN')}</span>
                    </div>
                ) : (
                    <div className="bg-orange-100 text-orange-800 py-2 rounded border border-orange-200">
                        Thanh toán khi nhận hàng (COD)
                    </div>
                )}
            </div>

            {!order.isPaid && clientId && (
              <PayPalScriptProvider options={{ "client-id": clientId, currency: "USD" }}>
                <PayPalButtons 
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          { amount: { value: (order.totalPrice / 25000).toFixed(2) } }, 
                        ],
                      });
                    }}
                    onApprove={onApprove}
                />
              </PayPalScriptProvider>
            )}

            {/* NÚT ADMIN GIAO HÀNG - Chỉ hiện khi chưa hoàn tất giao hàng */}
            {userInfo && userInfo.isAdmin && order.status !== "Đã giao hàng" && (
              <button onClick={deliverHandler} className="w-full bg-slate-800 text-white py-3 rounded mt-4 hover:bg-slate-700 font-bold transition">
                ĐÁNH DẤU ĐÃ GIAO HÀNG
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
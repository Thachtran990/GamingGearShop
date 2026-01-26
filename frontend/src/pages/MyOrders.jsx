import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchMyOrders = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) return;

      try {
        // Gọi API kèm theo userId
        const res = await fetch(`/api/orders/myorders?userId=${userInfo._id}`);
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMyOrders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">ĐƠN HÀNG CỦA TÔI</h1>

      {orders.length === 0 ? (
        <div className="text-center">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/" className="text-blue-600 hover:underline">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Mã đơn (ID)</th>
                <th className="py-3 px-4 text-left">Ngày đặt</th>
                <th className="py-3 px-4 text-left">Tổng tiền</th>
                <th className="py-3 px-4 text-left">Thanh toán</th>
                <th className="py-3 px-4 text-left">Giao hàng</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-mono text-blue-600">{order._id}</td>
                  <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3 px-4 font-bold">{order.totalPrice.toLocaleString('vi-VN')} đ</td>
                  <td className="py-3 px-4">
                    {order.isPaid ? (
                      <span className="text-green-600 font-bold">Đã trả</span>
                    ) : (
                      <span className="text-red-500">Chưa trả</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {order.isDelivered ? (
                      <span className="text-green-600 font-bold">Đã giao</span>
                    ) : (
                      <span className="text-yellow-600">Đang xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
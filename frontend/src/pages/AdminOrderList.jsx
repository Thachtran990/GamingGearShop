import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      // Kiểm tra quyền Admin
      if (!userInfo || !userInfo.isAdmin) {
        navigate("/");
        return;
      }

      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrders();
  }, [navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">QUẢN LÝ TẤT CẢ ĐƠN HÀNG</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Mã Đơn</th>
              <th className="py-3 px-4 text-left">Khách hàng</th>
              <th className="py-3 px-4 text-left">Ngày đặt</th>
              <th className="py-3 px-4 text-left">Tổng tiền</th>
              <th className="py-3 px-4 text-left">Trạng thái</th>
              <th className="py-3 px-4 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-sm font-mono text-blue-600">{order._id}</td>
                <td className="py-3 px-4 font-semibold">
                  {order.user ? order.user.username : "Khách vãng lai"}
                </td>
                <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="py-3 px-4 font-bold">{order.totalPrice.toLocaleString('vi-VN')} đ</td>
                <td className="py-3 px-4">
                  {order.isDelivered ? (
                    <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded">Đã giao</span>
                  ) : (
                    <span className="text-yellow-600 font-bold bg-yellow-100 px-2 py-1 rounded">Chờ giao</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderList;
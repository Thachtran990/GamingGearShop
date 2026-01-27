import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchMyOrders = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) return;

      try {
        const res = await fetch(`/api/orders/myorders?userId=${userInfo._id}`, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        
        if (!res.ok) {
            console.error("Lỗi tải đơn hàng:", res.status);
            return;
        }

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
                <th className="py-3 px-4 text-left">Trạng thái</th> {/* Đổi tên cột cho chuẩn */}
                <th className="py-3 px-4 text-left">Chi tiết</th> 
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-mono text-blue-600">{order._id}</td>
                  <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3 px-4 font-bold">{order.totalPrice.toLocaleString('vi-VN')} đ</td>
                  
                  {/* CỘT THANH TOÁN */}
                  <td className="py-3 px-4">
                    {order.isPaid ? (
                      <span className="text-green-600 font-bold">Đã trả</span>
                    ) : (
                      <span className="text-red-500">Chưa trả</span>
                    )}
                  </td>

                  {/* 👇 CỘT TRẠNG THÁI GIAO HÀNG (SỬA LẠI ĐỂ HIỆN TEXT CỤ THỂ) */}
                  <td className="py-3 px-4">
                     {(() => {
                        // Logic chọn màu và hiển thị text ngay tại đây
                        let statusColor = "text-yellow-600"; // Mặc định là chờ xử lý
                        if (order.status === "Đang giao hàng") statusColor = "text-blue-600 font-bold";
                        if (order.status === "Đã giao hàng") statusColor = "text-green-600 font-bold";
                        if (order.status === "Đã hủy") statusColor = "text-red-600 font-bold";

                        return (
                            <span className={statusColor}>
                                {order.status || (order.isDelivered ? "Đã giao hàng" : "Chờ xử lý")}
                            </span>
                        )
                     })()}
                  </td>

                  <td className="py-3 px-4">
                    <Link 
                        to={`/order/${order._id}`} 
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                        Xem
                    </Link>
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
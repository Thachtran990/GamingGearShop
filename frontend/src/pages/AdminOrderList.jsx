import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDeleted, setViewDeleted] = useState(false); // 👇 State mới: Chế độ xem thùng rác
  
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();

  // 1. Hàm lấy danh sách (Có tham số deleted)
  const fetchOrders = async () => {
    setLoading(true); // Hiệu ứng load cho mượt
    try {
      // 👇 Gửi thêm ?deleted=true hoặc false lên server
      const res = await fetch(`/api/orders?deleted=${viewDeleted}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Mỗi khi biến viewDeleted thay đổi -> Gọi lại API
  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      fetchOrders();
    } else {
      navigate("/login");
    }
  }, [viewDeleted]); // <-- Theo dõi biến này

  // 2. Xử lý trạng thái (Giữ nguyên)
  const updateStatusHandler = async (orderId, newStatus) => {
    if(!window.confirm(`Chuyển trạng thái sang: ${newStatus}?`)) return;
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (error) { console.error(error); }
  };

  // 3. Xử lý Xóa (Giữ nguyên)
  const deleteHandler = async (id) => {
    if (window.confirm("Chuyển đơn này vào thùng rác?")) {
      try {
        await fetch(`/api/orders/${id}/admin-delete`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        fetchOrders();
      } catch (error) { console.error(error); }
    }
  };

  // 4. Xử lý Khôi phục (MỚI)
  const restoreHandler = async (id) => {
    if (window.confirm("Khôi phục đơn hàng này lại danh sách chính?")) {
      try {
        await fetch(`/api/orders/${id}/admin-restore`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        fetchOrders();
      } catch (error) { console.error(error); }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Đã giao hàng": return "bg-green-100 text-green-800 border-green-200";
      case "Đang giao hàng": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Đã hủy": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800 uppercase border-l-4 border-yellow-400 pl-3">
            {viewDeleted ? "🗑️ THÙNG RÁC ĐƠN HÀNG" : "📋 QUẢN LÝ ĐƠN HÀNG"}
          </h1>

          {/* 👇 NÚT CHUYỂN ĐỔI CHẾ ĐỘ XEM */}
          <button 
            onClick={() => setViewDeleted(!viewDeleted)}
            className={`px-4 py-2 rounded font-bold shadow transition flex items-center gap-2 ${
                viewDeleted 
                ? "bg-gray-600 text-white hover:bg-gray-700" 
                : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
          >
            {viewDeleted ? "⬅️ Quay lại danh sách" : "🗑️ Xem thùng rác"}
          </button>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Đang tải dữ liệu...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10 text-gray-500 italic border rounded-lg bg-gray-50">
            {viewDeleted ? "Thùng rác trống rỗng!" : "Chưa có đơn hàng nào."}
        </div>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className={`text-xs text-white uppercase ${viewDeleted ? "bg-red-800" : "bg-slate-800"}`}>
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50 bg-white">
                  <td className="px-4 py-3 font-mono text-blue-600 font-bold">{order._id.substring(0, 10)}...</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {order.guestInfo?.name || order.user?.name || "Khách vãng lai"}
                  </td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{order.totalPrice.toLocaleString('vi-VN')} đ</td>
                  
                  {/* Trạng thái */}
                  <td className="px-4 py-3 text-center">
                      {viewDeleted ? (
                          // Nếu ở thùng rác thì chỉ hiện text, ko cho sửa
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadge(order.status)}`}>
                              {order.status}
                          </span>
                      ) : (
                          // Nếu ở danh sách thường thì cho sửa
                          <select 
                            value={order.status || "Chờ xử lý"}
                            onChange={(e) => updateStatusHandler(order._id, e.target.value)}
                            className={`border rounded px-2 py-1 text-xs font-bold outline-none cursor-pointer ${getStatusBadge(order.status)}`}
                          >
                            <option value="Chờ xử lý">⏳ Chờ xử lý</option>
                            <option value="Đang giao hàng">🚚 Đang giao hàng</option>
                            <option value="Đã giao hàng">✅ Đã giao hàng</option>
                            <option value="Đã hủy">❌ Đã hủy</option>
                          </select>
                      )}
                  </td>

                  {/* Hành động */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <Link to={`/order/${order._id}`} className="text-gray-500 hover:text-blue-600" title="Xem chi tiết">
                          👁️
                      </Link>
                      
                      {viewDeleted ? (
                          // 👇 Nút Khôi phục (Chỉ hiện trong thùng rác)
                          <button 
                              onClick={() => restoreHandler(order._id)}
                              className="text-green-500 hover:text-green-700 font-bold text-lg"
                              title="Khôi phục lại danh sách"
                          >
                              ♻️
                          </button>
                      ) : (
                          // 👇 Nút Xóa (Chỉ hiện trong danh sách chính)
                          <button 
                              onClick={() => deleteHandler(order._id)}
                              className="text-gray-400 hover:text-red-600 text-lg"
                              title="Chuyển vào thùng rác"
                          >
                              🗑️
                          </button>
                      )}
                    </div>
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

export default AdminOrderList;
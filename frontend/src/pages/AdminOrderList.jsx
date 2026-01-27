import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // Tab đang chọn
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Hàm tải lại đơn hàng
  const fetchOrders = async () => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate("/");
      return;
    }
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const data = await res.json();
      // Sắp xếp đơn mới nhất lên đầu
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  // --- XỬ LÝ CHUYỂN TRẠNG THÁI ---
  const updateStatusHandler = async (id, status) => {
    if(!window.confirm(`Chuyển trạng thái sang: ${status}?`)) return;
    try {
        await fetch(`/api/orders/${id}/status`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}` 
            },
            body: JSON.stringify({ status }),
        });
        fetchOrders(); // Tải lại dữ liệu
    } catch (error) {
        alert("Lỗi cập nhật");
    }
  };

  // --- XỬ LÝ XÓA / KHÔI PHỤC ---
  const deleteHandler = async (id, isDeletedCurrent) => {
    const msg = isDeletedCurrent 
        ? "Bạn muốn KHÔI PHỤC đơn này?" 
        : "Bạn muốn chuyển đơn này vào THÙNG RÁC?";
    
    if (window.confirm(msg)) {
        try {
            await fetch(`/api/orders/${id}/delete`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            fetchOrders();
        } catch (error) {
            alert("Lỗi thao tác");
        }
    }
  };

  // --- LOGIC LỌC ĐƠN HÀNG THEO TAB ---
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "deleted") return order.isDeleted; // Tab thùng rác
    if (order.isDeleted) return false; // Các tab khác thì ẩn đơn đã xóa đi

    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  // Danh sách các Tab
  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "Chờ xử lý", label: "⏳ Chờ xử lý" },
    { id: "Đang giao hàng", label: "🚚 Đang giao" },
    { id: "Đã giao hàng", label: "✅ Đã giao" },
    { id: "deleted", label: "🗑️ Thùng rác" },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-800">QUẢN LÝ ĐƠN HÀNG</h1>

      {/* --- THANH TAB --- */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full font-bold transition ${
                    activeTab === tab.id 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      {/* --- BẢNG ĐƠN HÀNG --- */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Mã Đơn</th>
              <th className="py-3 px-4 text-left">Khách hàng</th>
              <th className="py-3 px-4 text-left">Tổng tiền</th>
              <th className="py-3 px-4 text-left">Trạng thái</th>
              <th className="py-3 px-4 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">Không có đơn hàng nào</td></tr>
            ) : (
                filteredOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono text-blue-600">
                        {order._id} <br/>
                        <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </td>
                    <td className="py-3 px-4">
                        <span className="font-bold block">{order.user ? order.user.name : (order.guestInfo?.name || "Khách")}</span>
                        <span className="text-xs text-gray-500">{order.user ? order.user.email : order.guestInfo?.email}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-red-600">{order.totalPrice.toLocaleString('vi-VN')} đ</td>
                    
                    {/* CỘT TRẠNG THÁI (Có Select để đổi nhanh) */}
                    <td className="py-3 px-4">
                        {order.isDeleted ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">ĐÃ XÓA</span>
                        ) : (
                            <select 
                                value={order.status || "Chờ xử lý"} // Fallback nếu đơn cũ chưa có status
                                onChange={(e) => updateStatusHandler(order._id, e.target.value)}
                                className={`border rounded px-2 py-1 text-sm font-bold cursor-pointer outline-none
                                    ${order.status === 'Đã giao hàng' ? 'text-green-600 border-green-200 bg-green-50' : 
                                      order.status === 'Đang giao hàng' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-yellow-600 border-yellow-200 bg-yellow-50'}`}
                            >
                                <option value="Chờ xử lý">⏳ Chờ xử lý</option>
                                <option value="Đang giao hàng">🚚 Đang giao</option>
                                <option value="Đã giao hàng">✅ Đã giao</option>
                            </select>
                        )}
                    </td>

                    {/* CỘT HÀNH ĐỘNG */}
                    <td className="py-3 px-4 flex gap-2">
                        <Link to={`/order/${order._id}`}>
                            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded" title="Xem chi tiết">
                                👁️
                            </button>
                        </Link>

                        {/* Nút Xóa / Khôi phục */}
                        <button 
                            onClick={() => deleteHandler(order._id, order.isDeleted)}
                            className={`p-2 rounded text-white ${order.isDeleted ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                            title={order.isDeleted ? "Khôi phục" : "Xóa đơn này"}
                        >
                            {order.isDeleted ? "♻️" : "🗑️"}
                        </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderList;
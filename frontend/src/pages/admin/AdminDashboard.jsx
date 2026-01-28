import { useEffect, useState } from "react";
import axios from "axios";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { FaMoneyBillWave, FaShoppingCart, FaUser, FaBoxOpen } from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersCount: 0,
    productsCount: 0,
    usersCount: 0,
    dailyStats: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const { data } = await axios.get("/api/orders/stats", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setStats(data);
      } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
      }
    };
    fetchStats();
  }, []);

  // Format tiền tệ
  const formatCurrency = (num) => {
    return num?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">TỔNG QUAN HỆ THỐNG</h1>

      {/* 1. CÁC THẺ CARD THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Doanh thu */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center border-l-4 border-green-500">
          <div className="p-4 bg-green-100 rounded-full text-green-600 mr-4 text-2xl">
            <FaMoneyBillWave />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-bold">TỔNG DOANH THU</p>
            <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</h3>
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center border-l-4 border-blue-500">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600 mr-4 text-2xl">
            <FaShoppingCart />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-bold">TỔNG ĐƠN HÀNG</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.ordersCount}</h3>
          </div>
        </div>

        {/* Khách hàng */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center border-l-4 border-yellow-500">
          <div className="p-4 bg-yellow-100 rounded-full text-yellow-600 mr-4 text-2xl">
            <FaUser />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-bold">KHÁCH HÀNG</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.usersCount}</h3>
          </div>
        </div>

        {/* Sản phẩm */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center border-l-4 border-purple-500">
          <div className="p-4 bg-purple-100 rounded-full text-purple-600 mr-4 text-2xl">
            <FaBoxOpen />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-bold">SẢN PHẨM</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.productsCount}</h3>
          </div>
        </div>
      </div>

      {/* 2. BIỂU ĐỒ DOANH THU */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Biểu đồ chính chiếm 2/3 */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 text-gray-700">Biểu đồ Doanh thu (7 ngày qua)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyStats}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" />
                <YAxis 
                   tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)} 
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" name="Doanh thu" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Box bên cạnh (Ví dụ tin tức hoặc hoạt động gần đây) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
           <h2 className="text-xl font-bold mb-4 text-gray-700">Hoạt động gần đây</h2>
           <div className="space-y-4">
              {/* Giả lập danh sách hoạt động */}
              <div className="flex items-center gap-3 text-sm">
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 <span className="text-gray-600">Hệ thống đang hoạt động ổn định</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                 <span className="text-gray-600">Đã cập nhật tính năng Gallery</span>
              </div>
              <div className="p-4 bg-blue-50 rounded text-blue-800 text-sm mt-4">
                 💡 <strong>Mẹo:</strong> Hãy kiểm tra đơn hàng mỗi sáng để đảm bảo giao hàng đúng hẹn.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
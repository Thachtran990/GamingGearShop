import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaTicketAlt, FaPlus } from "react-icons/fa";

const AdminCouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State form tạo mã
  const [formData, setFormData] = useState({
    code: "",
    discountType: "fixed", // Mặc định giảm tiền mặt
    discountValue: 0,
    minOrderValue: 0,
    maxDiscountAmount: 0,
    expirationDate: "",
    countInStock: 100
  });

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  // 1. Lấy danh sách mã
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/coupons", config);
      setCoupons(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // 2. Xử lý nhập liệu form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Tạo mã mới
  const createHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/coupons", formData, config);
      alert("Đã tạo mã giảm giá thành công!");
      // Reset form
      setFormData({ 
          code: "", discountType: "fixed", discountValue: 0, 
          minOrderValue: 0, maxDiscountAmount: 0, 
          expirationDate: "", countInStock: 100 
      });
      fetchCoupons(); // Load lại danh sách
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi tạo mã");
    }
  };

  // 4. Xóa mã
  const deleteHandler = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa mã này?")) {
      try {
        await axios.delete(`/api/coupons/${id}`, config);
        alert("Đã xóa thành công");
        fetchCoupons();
      } catch (error) {
        alert("Lỗi xóa mã");
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaTicketAlt className="text-purple-600" /> QUẢN LÝ MÃ GIẢM GIÁ
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- CỘT TRÁI: FORM TẠO MÃ --- */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4 text-purple-700 flex items-center gap-2">
            <FaPlus /> Tạo Mã Mới
          </h2>
          <form onSubmit={createHandler}>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Mã Code (VD: TET2026)</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full p-2 border rounded uppercase font-bold text-purple-700" required placeholder="Nhập mã..." />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-bold mb-1">Loại giảm</label>
                    <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="fixed">Tiền mặt (VNĐ)</option>
                        <option value="percent">Phần trăm (%)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Giá trị giảm</label>
                    <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} className="w-full p-2 border rounded font-bold" required />
                    <p className="text-xs text-gray-500 mt-1">{formData.discountType === 'percent' ? '% (VD: 10)' : 'VNĐ (VD: 50000)'}</p>
                </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Đơn tối thiểu (VNĐ)</label>
              <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>

            {formData.discountType === 'percent' && (
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-1">Giảm tối đa (VNĐ)</label>
                    <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} className="w-full p-2 border rounded" />
                    <p className="text-xs text-gray-500">Nhập 0 nếu không giới hạn</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-bold mb-1">Số lượng</label>
                    <input type="number" name="countInStock" value={formData.countInStock} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Hết hạn ngày</label>
                    <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
            </div>

            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded transition">
              + TẠO MÃ NGAY
            </button>
          </form>
        </div>

        {/* --- CỘT PHẢI: DANH SÁCH MÃ --- */}
        <div className="lg:col-span-2">
           <h2 className="text-xl font-bold mb-4 text-gray-700">Danh sách mã đang chạy</h2>
           {loading ? <p>Đang tải...</p> : (
             <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700 uppercase">
                        <tr>
                            <th className="py-3 px-4 text-left">Mã</th>
                            <th className="py-3 px-4 text-left">Giảm</th>
                            <th className="py-3 px-4 text-left">Điều kiện</th>
                            <th className="py-3 px-4 text-left">Hạn / SL</th>
                            <th className="py-3 px-4 text-center">Xóa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {coupons.map((coupon) => (
                            <tr key={coupon._id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 font-bold text-purple-700">{coupon.code}</td>
                                <td className="py-3 px-4">
                                    <span className="bg-green-100 text-green-800 py-1 px-2 rounded font-bold">
                                        {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `-${coupon.discountValue.toLocaleString()}đ`}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-gray-600">
                                    Đơn &gt; {coupon.minOrderValue.toLocaleString()}đ
                                </td>
                                <td className="py-3 px-4">
                                    <div className="text-xs">
                                        <p>Hết: {new Date(coupon.expirationDate).toLocaleDateString('vi-VN')}</p>
                                        <p className="font-bold">Đã dùng: {coupon.usedCount} / {coupon.countInStock}</p>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <button onClick={() => deleteHandler(coupon._id)} className="text-red-500 hover:text-red-700 text-lg">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && (
                            <tr><td colSpan="5" className="text-center py-4 text-gray-500">Chưa có mã giảm giá nào.</td></tr>
                        )}
                    </tbody>
                </table>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default AdminCouponList;
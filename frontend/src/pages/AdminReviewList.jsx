import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AdminReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({}); // Lưu nội dung trả lời cho từng comment

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // 1. Hàm lấy dữ liệu
  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/products/admin/reviews", {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const data = await res.json();
      setReviews(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 2. Xử lý Trả lời
  const handleReply = async (productId, reviewId) => {
    const text = replyText[reviewId];
    if (!text) return alert("Bạn chưa nhập nội dung trả lời");

    try {
        await fetch(`/api/products/reviews/${productId}/${reviewId}/reply`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}` 
            },
            body: JSON.stringify({ reply: text })
        });
        alert("Đã trả lời!");
        fetchReviews(); // Load lại
    } catch (error) {
        console.error(error);
    }
  };

  // 3. Xử lý Spam
  const handleSpam = async (productId, reviewId) => {
    if(window.confirm("Bạn có chắc muốn đổi trạng thái Spam bình luận này?")) {
        try {
            await fetch(`/api/products/reviews/${productId}/${reviewId}/spam`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            fetchReviews();
        } catch (error) {
            console.error(error);
        }
    }
  };

  // 4. Xử lý Xóa
  const handleDelete = async (productId, reviewId) => {
    if(window.confirm("Xóa vĩnh viễn bình luận này? Hành động này không thể hoàn tác!")) {
        try {
            await fetch(`/api/products/reviews/${productId}/${reviewId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            fetchReviews();
        } catch (error) {
            console.error(error);
        }
    }
  };

  if (loading) return <div className="p-4">Đang tải đánh giá...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">QUẢN LÝ BÌNH LUẬN & ĐÁNH GIÁ</h1>
      
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-white uppercase bg-gray-800">
            <tr>
              <th className="px-6 py-3">Sản phẩm</th>
              <th className="px-6 py-3">Khách hàng</th>
              <th className="px-6 py-3">Nội dung</th>
              <th className="px-6 py-3">Admin Trả lời</th>
              <th className="px-6 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id} className={`bg-white border-b hover:bg-gray-50 ${r.isSpam ? "bg-red-50" : ""}`}>
                
                {/* Cột Sản phẩm */}
                <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                        <img src={r.productImage} className="w-10 h-10 object-cover rounded"/>
                        <Link to={`/product/${r.productId}`} className="text-blue-600 hover:underline line-clamp-2 w-32">
                            {r.productName}
                        </Link>
                    </div>
                </td>

                {/* Cột Khách hàng */}
                <td className="px-6 py-4">
                    <div className="font-bold">{r.userName}</div>
                    <div className="text-yellow-500 text-xs">{"⭐".repeat(r.rating)}</div>
                    <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
                </td>

                {/* Cột Nội dung comment */}
                <td className="px-6 py-4">
                    <p className={`text-gray-800 ${r.isSpam ? "line-through text-red-400" : ""}`}>{r.comment}</p>
                    {r.isSpam && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">SPAM</span>}
                </td>

                {/* Cột Admin trả lời */}
                <td className="px-6 py-4 w-1/4">
                    {r.adminReply ? (
                        <div className="bg-blue-50 p-2 rounded text-blue-800 text-xs border border-blue-200">
                            <strong>Admin:</strong> {r.adminReply}
                        </div>
                    ) : (
                        <div className="flex gap-1">
                            <input 
                                type="text" 
                                placeholder="Nhập câu trả lời..." 
                                className="border rounded px-2 py-1 w-full text-xs"
                                onChange={(e) => setReplyText({...replyText, [r._id]: e.target.value})}
                            />
                            <button 
                                onClick={() => handleReply(r.productId, r._id)}
                                className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                            >
                                Gửi
                            </button>
                        </div>
                    )}
                </td>

                {/* Cột Hành động */}
                <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => handleSpam(r.productId, r._id)}
                            className={`px-3 py-1 rounded text-xs font-bold text-white ${r.isSpam ? "bg-green-500" : "bg-orange-500"}`}
                        >
                            {r.isSpam ? "Bỏ Spam" : "Spam"}
                        </button>
                        <button 
                            onClick={() => handleDelete(r.productId, r._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                        >
                            Xóa
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviewList;
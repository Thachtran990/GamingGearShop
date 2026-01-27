import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// 1. Component ReplyForm (Form trả lời nhỏ - Đặt ở đây cho gọn)
const ReplyForm = ({ productId, reviewId, userInfo, onSuccess }) => {
  const [text, setText] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if(!text.trim()) return;

    try {
      await fetch(`/api/products/reviews/${productId}/${reviewId}/reply`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ 
           comment: text,
           name: userInfo.name,
           userId: userInfo._id,
           isAdmin: userInfo.isAdmin
        })
      });
      setText("");
      setShowInput(false);
      onSuccess(); // Load lại dữ liệu cha
    } catch (error) {
      console.error(error);
    }
  };

  if (!showInput) {
    return (
      <button 
        onClick={() => setShowInput(true)}
        className="text-sm text-blue-600 hover:underline font-semibold mt-2"
      >
        💬 Trả lời
      </button>
    );
  }

  return (
    <form onSubmit={handleReply} className="flex gap-2 mt-2 items-start">
      <input 
        type="text" 
        className="flex-1 border rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
        placeholder="Viết câu trả lời..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Gửi</button>
      <button type="button" onClick={() => setShowInput(false)} className="text-gray-500 text-sm hover:text-gray-700 py-1">Hủy</button>
    </form>
  );
};

// 2. Component Chính
const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  
  // State cho phần bình luận
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const userInfo = localStorage.getItem("userInfo") 
    ? JSON.parse(localStorage.getItem("userInfo")) 
    : null;

  // Hàm load lại dữ liệu
  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Xử lý gửi bình luận GỐC
  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      alert("Vui lòng đăng nhập để đánh giá");
      return;
    }
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          rating,
          comment,
          userId: userInfo._id,
          name: userInfo.name || userInfo.username || "Khách hàng"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Cảm ơn bạn đã đánh giá!");
        setComment("");
        setRating(5);
        fetchProduct(); // Load lại để hiện bình luận mới
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!product) return <div className="text-center mt-10">Đang tải...</div>;

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="text-gray-600 hover:underline mb-4 block">
        &larr; Quay lại
      </Link>
      
      {/* PHẦN TRÊN: THÔNG TIN SẢN PHẨM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow-lg mb-8">
        <div>
          <img src={product.image} alt={product.name} className="w-full rounded-lg shadow-sm" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4 text-yellow-500 text-lg">
            <span className="font-bold mr-2">{product.rating.toFixed(1)} / 5</span>
             <span>({product.numReviews} đánh giá)</span>
          </div>

          <p className="text-red-600 text-2xl font-bold mb-6">
            {product.price.toLocaleString('vi-VN')} đ
          </p>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description || "Mô tả đang cập nhật..."}
          </p>
          <div className="border-t pt-6">
            <button 
              onClick={() => addToCart(product)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
            >
              THÊM VÀO GIỎ HÀNG
            </button>
          </div>
        </div>
      </div>

      {/* PHẦN DƯỚI: ĐÁNH GIÁ & BÌNH LUẬN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Cột trái: Danh sách bình luận */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Đánh giá từ khách hàng</h2>
          {product.reviews.length === 0 && <p className="text-gray-500">Chưa có đánh giá nào.</p>}
          
          <div className="space-y-4 h-96 overflow-y-auto pr-2">
            {product.reviews.map((review) => (
              !review.isSpam && (
                <div key={review._id} className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm border border-gray-100">
                  
                  {/* 1. NỘI DUNG REVIEW GỐC */}
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-gray-900 text-lg">{review.name}</strong>
                      <div className="text-yellow-500 text-sm mb-1">{"⭐".repeat(review.rating)}</div>
                      <p className="text-gray-600 text-sm mb-2">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                      <p className="text-gray-800 text-base font-medium">{review.comment}</p>
                    </div>
                  </div>

                  {/* 2. DANH SÁCH CÁC CÂU TRẢ LỜI (REPLIES) */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-300 space-y-3 bg-white py-2 rounded">
                      {review.replies.map((rep) => (
                        <div key={rep._id} className={`p-3 rounded-lg text-sm ${rep.isAdmin ? "bg-blue-50 border border-blue-100" : "bg-gray-100 border border-gray-200"}`}>
                          <div className="flex justify-between items-center mb-1">
                            <strong className={rep.isAdmin ? "text-blue-700" : "text-gray-700"}>
                              {rep.isAdmin ? `🛡️ Admin (${rep.name})` : rep.name}
                            </strong>
                            <span className="text-xs text-gray-400">
                              {new Date(rep.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-gray-700">{rep.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. FORM TRẢ LỜI (CHỈ HIỆN KHI ĐĂNG NHẬP) */}
                  {userInfo && (
                    <div className="mt-2 border-t border-gray-200 pt-2">
                       <ReplyForm 
                          productId={product._id} 
                          reviewId={review._id} 
                          userInfo={userInfo} 
                          onSuccess={fetchProduct} 
                       />
                    </div>
                  )}

                </div>
              )
            ))}
          </div>
        </div>

        {/* Cột phải: Form viết bình luận */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Viết đánh giá của bạn</h2>
          {userInfo ? (
            <form onSubmit={submitReviewHandler}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Đánh giá:</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option value="1">1 - Tệ</option>
                  <option value="2">2 - Tạm được</option>
                  <option value="3">3 - Bình thường</option>
                  <option value="4">4 - Tốt</option>
                  <option value="5">5 - Tuyệt vời</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Bình luận:</label>
                <textarea 
                  rows="3" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
                GỬI ĐÁNH GIÁ
              </button>
            </form>
          ) : (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
              Vui lòng <Link to="/login" className="underline font-bold">Đăng nhập</Link> để viết đánh giá.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 👇 ĐÂY LÀ DÒNG BẠN ĐANG BỊ THIẾU
export default ProductDetail;
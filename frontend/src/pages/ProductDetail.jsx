import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Component con: Form trả lời review (Giữ nguyên logic cũ của bạn)
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
      onSuccess();
    } catch (error) { console.error(error); }
  };

  if (!showInput) return <button onClick={() => setShowInput(true)} className="text-sm text-blue-600 hover:underline font-semibold mt-2">💬 Trả lời</button>;

  return (
    <form onSubmit={handleReply} className="flex gap-2 mt-2 items-start">
      <input type="text" className="flex-1 border rounded px-3 py-1 text-sm outline-none" placeholder="Viết câu trả lời..." value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Gửi</button>
      <button type="button" onClick={() => setShowInput(false)} className="text-gray-500 text-sm py-1">Hủy</button>
    </form>
  );
};

// --- COMPONENT CHÍNH ---
const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  
  // State quản lý biến thể
  const [selectedVariant, setSelectedVariant] = useState(null);

  // State review
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const userInfo = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null;

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setProduct(data);
      
      // Mặc định chọn biến thể đầu tiên nếu có
      if (data.hasVariants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (error) { console.error("Lỗi:", error); }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  // Logic xử lý khi người dùng click chọn biến thể
  // Ở đây mình làm đơn giản: Hiển thị danh sách các biến thể để chọn
  // (Nâng cao hơn có thể làm bộ lọc màu/size, nhưng logic này phức tạp hơn)
  
  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!userInfo) return alert("Vui lòng đăng nhập");
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ rating, comment, userId: userInfo._id, name: userInfo.name }),
      });
      if (res.ok) { alert("Đánh giá thành công!"); setComment(""); fetchProduct(); } 
      else { alert("Lỗi gửi đánh giá"); }
    } catch (error) { console.error(error); }
  };

  const handleAddToCart = () => {
    if (product.hasVariants) {
      // Nếu là SP biến thể, gửi thông tin biến thể vào giỏ
      // Lưu ý: CartContext của bạn cần sửa 1 chút để nhận diện variant, 
      // nhưng tạm thời gửi product gốc kèm giá đã chọn để hiển thị đúng
      const productToAdd = {
        ...product,
        price: selectedVariant.price, // Lấy giá của biến thể
        image: selectedVariant.image || product.image, // Lấy ảnh biến thể (nếu có)
        name: `${product.name} (${selectedVariant.attributes.map(a => a.v).join(" - ")})`, // Tên + Thuộc tính
        countInStock: selectedVariant.countInStock,
        variantId: selectedVariant._id
      };
      addToCart(productToAdd);
    } else {
      addToCart(product);
    }
  };

  if (!product) return <div className="text-center mt-10">Đang tải...</div>;

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="text-gray-600 hover:underline mb-4 block">&larr; Quay lại</Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow-lg mb-8">
        {/* CỘT ẢNH */}
        <div>
          {/* Ưu tiên hiện ảnh của biến thể đang chọn, nếu không thì hiện ảnh gốc */}
          <img 
            src={(selectedVariant && selectedVariant.image) ? selectedVariant.image : product.image} 
            alt={product.name} 
            className="w-full rounded-lg shadow-sm object-cover" 
          />
        </div>

        {/* CỘT THÔNG TIN */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <div className="flex items-center mb-4 text-yellow-500 text-lg">
            <span className="font-bold mr-2">{product.rating.toFixed(1)} / 5</span>
             <span>({product.numReviews} đánh giá)</span>
          </div>

          {/* HIỂN THỊ GIÁ THÔNG MINH */}
          <p className="text-red-600 text-3xl font-bold mb-6">
            {product.hasVariants && selectedVariant 
              ? selectedVariant.price.toLocaleString('vi-VN') 
              : product.price.toLocaleString('vi-VN')} đ
          </p>

          {/* --- KHU VỰC CHỌN BIẾN THỂ (QUAN TRỌNG) --- */}
          {product.hasVariants && (
            <div className="mb-6 p-4 bg-gray-50 rounded border">
              <p className="font-bold mb-3 text-gray-700">Chọn phân loại:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded border text-sm transition-all ${
                      selectedVariant === variant 
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-200" 
                        : "border-gray-300 bg-white hover:border-gray-400 text-gray-700"
                    }`}
                  >
                    {/* Hiển thị chuỗi thuộc tính (VD: Đen - Red Switch) */}
                    {variant.attributes.map(attr => attr.v).join(" / ")}
                  </button>
                ))}
              </div>
              
              {/* Hiển thị kho của biến thể đang chọn */}
              {selectedVariant && (
                <p className="text-sm text-gray-500 mt-3">
                  Kho: <span className="font-bold">{selectedVariant.countInStock}</span> sản phẩm sẵn có
                </p>
              )}
            </div>
          )}

          <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          <div className="border-t pt-6">
            <button 
              onClick={handleAddToCart}
              // Disabled nếu hết hàng
              disabled={product.countInStock === 0 && (!selectedVariant || selectedVariant.countInStock === 0)}
              className={`w-full py-3 rounded-lg font-bold text-lg shadow-lg transition
                ${(product.hasVariants && selectedVariant?.countInStock === 0) || (!product.hasVariants && product.countInStock === 0)
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
              {(product.hasVariants && selectedVariant?.countInStock === 0) ? "HẾT HÀNG PHÂN LOẠI NÀY" : "THÊM VÀO GIỎ HÀNG"}
            </button>
          </div>
        </div>
      </div>

      {/* --- PHẦN BÌNH LUẬN (GIỮ NGUYÊN) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Đánh giá từ khách hàng</h2>
          {product.reviews.length === 0 && <p className="text-gray-500">Chưa có đánh giá nào.</p>}
          <div className="space-y-4 h-96 overflow-y-auto pr-2">
            {product.reviews.map((review) => (
              !review.isSpam && (
                <div key={review._id} className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-gray-900 text-lg">{review.name}</strong>
                      <div className="text-yellow-500 text-sm mb-1">{"⭐".repeat(review.rating)}</div>
                      <p className="text-gray-600 text-sm mb-2">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                      <p className="text-gray-800 text-base font-medium">{review.comment}</p>
                    </div>
                  </div>
                  {/* REPLIES LIST */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-300 space-y-3 bg-white py-2 rounded">
                      {review.replies.map((rep) => (
                        <div key={rep._id} className={`p-3 rounded-lg text-sm ${rep.isAdmin ? "bg-blue-50 border border-blue-100" : "bg-gray-100 border border-gray-200"}`}>
                           <strong className={rep.isAdmin ? "text-blue-700" : "text-gray-700"}>{rep.isAdmin ? `🛡️ Admin (${rep.name})` : rep.name}</strong>
                           <p className="text-gray-700">{rep.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {userInfo && <div className="mt-2 border-t pt-2"><ReplyForm productId={product._id} reviewId={review._id} userInfo={userInfo} onSuccess={fetchProduct} /></div>}
                </div>
              )
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Viết đánh giá</h2>
          {userInfo ? (
            <form onSubmit={submitReviewHandler}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Đánh giá:</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full p-2 border rounded">
                  <option value="5">5 - Tuyệt vời</option>
                  <option value="4">4 - Tốt</option>
                  <option value="3">3 - Bình thường</option>
                  <option value="2">2 - Tạm được</option>
                  <option value="1">1 - Tệ</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Bình luận:</label>
                <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-2 border rounded" required></textarea>
              </div>
              <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">GỬI ĐÁNH GIÁ</button>
            </form>
          ) : (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded">Vui lòng <Link to="/login" className="underline font-bold">Đăng nhập</Link> để viết đánh giá.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Component con: Form trả lời review (Giữ nguyên)
const ReplyForm = ({ productId, reviewId, userInfo, onSuccess }) => {
  const [text, setText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const handleReply = async (e) => {
    e.preventDefault(); if(!text.trim()) return;
    try {
      await fetch(`/api/products/reviews/${productId}/${reviewId}/reply`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ comment: text, name: userInfo.name, userId: userInfo._id, isAdmin: userInfo.isAdmin })
      });
      setText(""); setShowInput(false); onSuccess();
    } catch (error) { console.error(error); }
  };
  if (!showInput) return <button onClick={() => setShowInput(true)} className="text-sm text-blue-600 hover:underline font-semibold mt-2">💬 Trả lời</button>;
  return ( <form onSubmit={handleReply} className="flex gap-2 mt-2 items-start"><input type="text" className="flex-1 border rounded px-3 py-1 text-sm outline-none" placeholder="Viết câu trả lời..." value={text} onChange={(e) => setText(e.target.value)} /><button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Gửi</button><button type="button" onClick={() => setShowInput(false)} className="text-gray-500 text-sm py-1">Hủy</button></form> );
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  
  // 👇 STATE MỚI: QUẢN LÝ LIGHTBOX (PHÓNG TO ẢNH)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const userInfo = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null;

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setProduct(data);
      setActiveImage(data.image);
      if (data.hasVariants && data.variants.length > 0) { setSelectedVariant(data.variants[0]); }
    } catch (error) { console.error("Lỗi:", error); }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  useEffect(() => {
    setQty(1);
    if (selectedVariant && selectedVariant.image) { setActiveImage(selectedVariant.image); } 
    else if (product) { setActiveImage(product.image); }
  }, [selectedVariant, product]);

  // 👇 LỌC ẢNH TRÙNG NHAU (GIỮ NGUYÊN)
  const getUniqueImages = () => {
      if (!product) return [];
      let images = [product.image];
      if (product.images) {
          product.images.forEach(img => { if (!images.includes(img)) images.push(img); });
      }
      if (product.hasVariants) {
          product.variants.forEach(v => { if (v.image && !images.includes(v.image)) images.push(v.image); });
      }
      return images;
  };
  const uniqueImageList = getUniqueImages();

  // 👇 HÀM CHUYỂN ẢNH (NEXT / PREV)
  const handleNextImage = (e) => {
    if(e) e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (để ko đóng modal)
    const currentIndex = uniqueImageList.indexOf(activeImage);
    const nextIndex = (currentIndex + 1) % uniqueImageList.length; // Quay vòng về đầu
    setActiveImage(uniqueImageList[nextIndex]);
  };

  const handlePrevImage = (e) => {
    if(e) e.stopPropagation();
    const currentIndex = uniqueImageList.indexOf(activeImage);
    const prevIndex = (currentIndex - 1 + uniqueImageList.length) % uniqueImageList.length; // Quay vòng về cuối
    setActiveImage(uniqueImageList[prevIndex]);
  };

  // 👇 BẮT SỰ KIỆN BÀN PHÍM (Mũi tên & ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (!isLightboxOpen) return; // Chỉ bắt phím khi đang mở to ảnh
        if (e.key === "ArrowRight") handleNextImage();
        if (e.key === "ArrowLeft") handlePrevImage();
        if (e.key === "Escape") setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, activeImage]); // Cập nhật khi state thay đổi

  const submitReviewHandler = async (e) => { /* ... Giữ nguyên ... */ 
      e.preventDefault(); if (!userInfo) return alert("Vui lòng đăng nhập");
      try { const res = await fetch(`/api/products/${id}/reviews`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}` }, body: JSON.stringify({ rating, comment, userId: userInfo._id, name: userInfo.name }), }); if (res.ok) { alert("Đánh giá thành công!"); setComment(""); fetchProduct(); } else { alert("Lỗi gửi đánh giá"); } } catch (error) { console.error(error); }
  };

  const handleAddToCart = () => { /* ... Giữ nguyên ... */
    let productToAdd = { ...product };
    if (product.hasVariants) {
      if (!selectedVariant) return alert("Vui lòng chọn phân loại hàng!");
      productToAdd = { ...product, price: selectedVariant.price, image: selectedVariant.image || product.image, name: `${product.name} (${selectedVariant.attributes.map(a => a.v).join(" - ")})`, countInStock: selectedVariant.countInStock, variantId: selectedVariant._id };
    }
    addToCart(productToAdd, Number(qty));
    alert("Đã thêm vào giỏ hàng!");
  };

  if (!product) return <div className="text-center mt-10">Đang tải...</div>;

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="text-gray-600 hover:underline mb-4 block">&larr; Quay lại</Link>
      
      {/* 👇 MODAL LIGHTBOX (PHÓNG TO ẢNH) - CHỈ HIỆN KHI isLightboxOpen = true */}
      {isLightboxOpen && (
        <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center animate-fade-in"
            onClick={() => setIsLightboxOpen(false)} // Bấm ra ngoài thì đóng
        >
            {/* Nút đóng */}
            <button className="absolute top-5 right-5 text-white text-4xl hover:text-gray-300 font-bold">&times;</button>
            
            {/* Nút Prev (Trái) */}
            <button onClick={handlePrevImage} className="absolute left-5 text-white text-5xl hover:scale-110 transition p-4">‹</button>
            
            {/* Ảnh To */}
            <img 
                src={activeImage} 
                alt="Zoomed" 
                className="max-h-[90vh] max-w-[90vw] object-contain cursor-default"
                onClick={(e) => e.stopPropagation()} // Bấm vào ảnh không bị đóng
            />

            {/* Nút Next (Phải) */}
            <button onClick={handleNextImage} className="absolute right-5 text-white text-5xl hover:scale-110 transition p-4">›</button>

            {/* Chỉ dẫn bàn phím */}
            <div className="absolute bottom-5 text-gray-400 text-sm">Dùng phím mũi tên ⬅️ ➡️ để chuyển ảnh</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow-lg mb-8">
        
        {/* CỘT ẢNH */}
        <div>
          {/* 1. KHUNG ẢNH CHÍNH (ĐÃ THÊM MŨI TÊN CHUYỂN ẢNH) */}
          <div className="relative group">
            <div 
                className="h-96 w-full mb-4 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)} // Bấm vào để mở to
            >
                <img src={activeImage || product.image} alt={product.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
            </div>

            {/* MŨI TÊN TRÁI (Trên ảnh chính) */}
            <button 
                onClick={handlePrevImage} 
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"
            >
                ❮
            </button>

            {/* MŨI TÊN PHẢI (Trên ảnh chính) */}
            <button 
                onClick={handleNextImage} 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"
            >
                ❯
            </button>
            
            {/* Icon phóng to gợi ý */}
            <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition text-xs pointer-events-none">🔍 Click để phóng to</div>
          </div>

          {/* 2. DANH SÁCH THUMBNAIL */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {uniqueImageList.map((img, idx) => (
                 <img 
                    key={idx}
                    src={img}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 transition-all hover:opacity-100 
                        ${activeImage === img ? 'border-blue-600 opacity-100 ring-2 ring-blue-100' : 'border-transparent opacity-70'}`}
                    alt={`Thumb ${idx}`}
                 />
             ))}
          </div>
        </div>

        {/* CỘT THÔNG TIN (Giữ nguyên) */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <div className="flex items-center mb-4 text-yellow-500 text-lg"><span className="font-bold mr-2">{product.rating.toFixed(1)} / 5</span><span>({product.numReviews} đánh giá)</span></div>
          <p className="text-red-600 text-3xl font-bold mb-6">{product.hasVariants && selectedVariant ? selectedVariant.price.toLocaleString('vi-VN') : product.price.toLocaleString('vi-VN')} đ</p>

          {product.hasVariants && (
            <div className="mb-6 p-4 bg-gray-50 rounded border">
              <p className="font-bold mb-3 text-gray-700">Chọn phân loại:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <button key={index} onClick={() => setSelectedVariant(variant)} className={`px-4 py-2 rounded border text-sm transition-all ${selectedVariant === variant ? "border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-200" : "border-gray-300 bg-white hover:border-gray-400 text-gray-700"}`}>
                    {variant.attributes.map(attr => attr.v).join(" / ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line">{product.description}</p>
          <div className="border-t pt-6">
            {(() => {
                let currentStock = product.countInStock; let isOutOfStock = false;
                if (product.hasVariants) { if (selectedVariant) { currentStock = selectedVariant.countInStock; if (currentStock === 0) isOutOfStock = true; } else { currentStock = 0; } } else { if (product.countInStock === 0) isOutOfStock = true; }
                return (
                    <>
                        {!isOutOfStock && (!product.hasVariants || selectedVariant) && (
                            <div className="flex items-center gap-4 mb-4">
                                <span className="font-bold text-gray-700">Số lượng:</span>
                                <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="p-2 border rounded w-20 text-center font-bold bg-gray-50 cursor-pointer">{[...Array(currentStock).keys()].slice(0, 10).map((x) => ( <option key={x + 1} value={x + 1}>{x + 1}</option> ))}</select>
                                <span className="text-sm text-gray-500">{currentStock} sản phẩm có sẵn</span>
                            </div>
                        )}
                        <button onClick={handleAddToCart} disabled={isOutOfStock || (product.hasVariants && !selectedVariant)} className={`w-full py-3 rounded-lg font-bold text-lg shadow-lg transition ${isOutOfStock || (product.hasVariants && !selectedVariant && product.variants.length > 0) ? "bg-gray-400 cursor-not-allowed text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>{isOutOfStock ? "TẠM HẾT HÀNG" : "THÊM VÀO GIỎ HÀNG"}</button>
                    </>
                );
            })()}
          </div>
        </div>
      </div>

      {/* COMMENT SECTION (Giữ nguyên) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
           <h2 className="text-2xl font-bold mb-4 border-b pb-2">Đánh giá từ khách hàng</h2>
           {product.reviews.length === 0 && <p className="text-gray-500">Chưa có đánh giá nào.</p>}
           <div className="space-y-4 h-96 overflow-y-auto pr-2">{product.reviews.map((review) => ( !review.isSpam && ( <div key={review._id} className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm border border-gray-100"><div className="flex justify-between items-start"><div><strong className="text-gray-900 text-lg">{review.name}</strong><div className="text-yellow-500 text-sm mb-1">{"⭐".repeat(review.rating)}</div><p className="text-gray-600 text-sm mb-2">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p><p className="text-gray-800 text-base font-medium">{review.comment}</p></div></div>{review.replies && review.replies.length > 0 && (<div className="mt-3 pl-4 border-l-2 border-gray-300 space-y-3 bg-white py-2 rounded">{review.replies.map((rep) => (<div key={rep._id} className={`p-3 rounded-lg text-sm ${rep.isAdmin ? "bg-blue-50 border border-blue-100" : "bg-gray-100 border border-gray-200"}`}><strong className={rep.isAdmin ? "text-blue-700" : "text-gray-700"}>{rep.isAdmin ? `🛡️ Admin (${rep.name})` : rep.name}</strong><p className="text-gray-700">{rep.comment}</p></div>))}</div>)}{userInfo && <div className="mt-2 border-t pt-2"><ReplyForm productId={product._id} reviewId={review._id} userInfo={userInfo} onSuccess={fetchProduct} /></div>}</div> ) ))}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
           <h2 className="text-2xl font-bold mb-4 border-b pb-2">Viết đánh giá</h2>
           {userInfo ? ( <form onSubmit={submitReviewHandler}><div className="mb-4"><label className="block text-gray-700 mb-2">Đánh giá:</label><select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full p-2 border rounded"><option value="5">5 - Tuyệt vời</option><option value="4">4 - Tốt</option><option value="3">3 - Bình thường</option><option value="2">2 - Tạm được</option><option value="1">1 - Tệ</option></select></div><div className="mb-4"><label className="block text-gray-700 mb-2">Bình luận:</label><textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-2 border rounded" required></textarea></div><button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">GỬI ĐÁNH GIÁ</button></form> ) : (<div className="p-4 bg-yellow-100 text-yellow-800 rounded">Vui lòng <Link to="/login" className="underline font-bold">Đăng nhập</Link> để viết đánh giá.</div>)}
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
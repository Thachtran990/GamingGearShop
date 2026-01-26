import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // useParams để lấy ID từ URL
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ đường dẫn
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div className="text-center mt-10">Đang tải...</div>;

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="text-gray-600 hover:underline mb-4 block">
        &larr; Quay lại
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow-lg">
        {/* Cột Trái: Ảnh */}
        <div>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full rounded-lg shadow-sm"
          />
        </div>

        {/* Cột Phải: Thông tin */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <p className="text-red-600 text-2xl font-bold mb-6">
            {product.price.toLocaleString('vi-VN')} đ
          </p>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description || "Mô tả đang cập nhật..."}
          </p>

          <div className="border-t pt-6">
            <button 
                onClick={() => addToCart(product)} // <--- Thêm dòng này
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
                >
                THÊM VÀO GIỎ HÀNG
                </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
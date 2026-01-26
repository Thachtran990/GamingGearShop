import { useState, useEffect } from 'react';

function App() {
  // 1. Tạo cái giỏ để chứa danh sách sản phẩm (ban đầu là rỗng)
  const [products, setProducts] = useState([]);

  // 2. Tự động chạy đi lấy dữ liệu khi vừa vào web
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Gọi điện cho Backend
        const res = await fetch('/api/products');
        // Chuyển dữ liệu nhận được thành JSON
        const data = await res.json();
        // Bỏ vào giỏ
        setProducts(data);
        console.log("Đã lấy được hàng:", data);
      } catch (error) {
        console.error("Lỗi rồi:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        DANH SÁCH SẢN PHẨM MỚI NHẤT
      </h1>

      {/* Lưới hiển thị sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 container mx-auto">
        {products.map((product) => (
          <div key={product._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-500 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-red-500 font-bold text-lg">
                {product.price.toLocaleString('vi-VN')} đ
              </span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
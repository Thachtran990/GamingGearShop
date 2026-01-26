import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        SẢN PHẨM MỚI NHẤT
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <div className="flex justify-between items-center">
              <span className="text-red-500 font-bold text-lg">
                {product.price.toLocaleString('vi-VN')} đ
              </span>
              <Link 
              to={`/product/${product._id}`} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Xem chi tiết
            </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
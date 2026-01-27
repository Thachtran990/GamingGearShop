import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Paginate from "../components/Paginate"; // <--- 1. Import Paginate

const Home = () => {
  const [products, setProducts] = useState([]);
  
  // Thêm state để lưu thông tin phân trang
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword"); 
  const pageNumber = searchParams.get("pageNumber") || 1; // <--- 2. Lấy số trang từ URL

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Gửi cả keyword và pageNumber lên Server
        let url = `/api/products?pageNumber=${pageNumber}`;
        if (keyword) {
          url += `&keyword=${keyword}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        // 3. Cập nhật dữ liệu từ cấu trúc mới của API
        setProducts(data.products);
        setPages(data.pages);
        setPage(data.page);

      } catch (error) {
        console.error("Lỗi:", error);
      }
    };
    fetchProducts();
  }, [keyword, pageNumber]); // Chạy lại khi keyword hoặc trang thay đổi

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        {keyword ? `Kết quả: "${keyword}"` : "SẢN PHẨM MỚI NHẤT"}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
             <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
             <div className="p-4">
                <Link to={`/product/${product._id}`}>
                  <h3 className="text-lg font-bold mb-2 hover:text-blue-600 truncate">{product.name}</h3>
                </Link>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-bold text-xl">
                    {product.price.toLocaleString('vi-VN')} đ
                  </span>
                  <Link 
                    to={`/product/${product._id}`} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Xem
                  </Link>
                </div>
             </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && (
         <p className="text-center text-gray-500 mt-10">Không tìm thấy sản phẩm nào.</p>
      )}

      {/* 👇 4. Hiển thị thanh phân trang ở dưới cùng */}
      <Paginate pages={pages} page={page} keyword={keyword ? keyword : ""} />
    </div>
  );
};

export default Home;
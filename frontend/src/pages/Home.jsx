import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Paginate from "../components/Paginate"; 

const Home = () => {
  // Khởi tạo là mảng rỗng để tránh lỗi map
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const pageNumber = searchParams.get("pageNumber") || 1;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `/api/products?pageNumber=${pageNumber}`;
        if (keyword) {
          url += `&keyword=${keyword}`;
        }
        
        const res = await fetch(url);
        const data = await res.json();
        
        // 👇 LOGIC AN TOÀN: Kiểm tra dữ liệu trước khi set
        if (data.products) {
           setProducts(data.products);
           setPages(data.pages);
           setPage(data.page);
        } else {
           // Fallback nếu backend chưa cập nhật kịp
           setProducts(Array.isArray(data) ? data : []); 
        }

      } catch (error) {
        console.error("Lỗi:", error);
      }
    };
    fetchProducts();
  }, [keyword, pageNumber]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 uppercase">
        {keyword ? `Kết quả tìm kiếm: "${keyword}"` : "SẢN PHẨM MỚI NHẤT"}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* 👇 DÙNG ?. ĐỂ KHÔNG BỊ CRASH NẾU PRODUCTS NULL */}
        {products?.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
             <Link to={`/product/${product._id}`}>
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover hover:opacity-90" />
             </Link>
             <div className="p-4">
                <Link to={`/product/${product._id}`}>
                  <h3 className="text-lg font-bold mb-2 hover:text-blue-600 truncate" title={product.name}>
                    {product.name}
                  </h3>
                </Link>

                {/* Hiển thị giá: Ưu tiên giá biến thể thấp nhất nếu có */}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-red-600 font-bold text-xl">
                    {product.price > 0 ? product.price.toLocaleString('vi-VN') : "Liên hệ"} đ
                  </span>
                  <Link 
                    to={`/product/${product._id}`} 
                    className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm font-semibold"
                  >
                    Chi tiết
                  </Link>
                </div>
             </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && (
         <div className="text-center py-10">
            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào.</p>
            <Link to="/" className="text-blue-500 hover:underline">Quay lại trang chủ</Link>
         </div>
      )}

      {/* Chỉ hiện phân trang khi có nhiều hơn 1 trang */}
      {pages > 1 && (
        <div className="mt-8 flex justify-center">
            <Paginate pages={pages} page={page} keyword={keyword ? keyword : ""} />
        </div>
      )}
    </div>
  );
};

export default Home;
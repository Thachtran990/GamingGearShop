import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Paginate from "../components/Paginate"; // 1. Import thanh phân trang

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  
  // Thêm state cho phân trang
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { pageNumber } = useParams(); // Lấy số trang từ URL (nếu có cấu hình route) hoặc dùng cách dưới
  
  // Cách lấy pageNumber từ URL đơn giản nhất giống bên Home
  const keyword = ""; // Admin hiện tại chưa làm tìm kiếm, để rỗng

  useEffect(() => {
    const fetchProducts = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      if (!userInfo || !userInfo.isAdmin) {
        navigate("/");
        return;
      }

      try {
        // 2. Gọi API có kèm số trang (Mặc định trang 1 nếu url không có)
        // Lưu ý: Để đơn giản cho admin, ta tạm lấy trang 1 hoặc xử lý logic lấy page từ URL sau
        // Ở đây mình lấy tạm page 1 để fix lỗi crash trước đã.
        // Để Admin chuyển trang được, bạn cần sửa Route trong App.jsx (xem Bước 2 bên dưới)
        // Hiện tại ta cứ gọi pageNumber từ đường dẫn hiện tại
        const currentPage = window.location.pathname.split("/")[3] || 1;

        const res = await fetch(`/api/products?pageNumber=${currentPage}`);
        const data = await res.json();
        
        // 3. QUAN TRỌNG: Dữ liệu giờ nằm trong data.products
        setProducts(data.products); 
        setPages(data.pages);
        setPage(data.page);

      } catch (error) {
        console.error(error);
      }
    };
    fetchProducts();
  }, [navigate]);

  const deleteHandler = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const res = await fetch(`/api/products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userInfo.token}`, // Nếu bạn có dùng token
          },
        });
        if (res.ok) {
          alert("Đã xóa sản phẩm");
          window.location.reload(); // Load lại trang
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">QUẢN LÝ SẢN PHẨM</h1>
        <Link to="/admin/productadd">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            + Thêm sản phẩm
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Tên</th>
              <th className="py-3 px-4 text-left">Giá</th>
              <th className="py-3 px-4 text-left">Danh mục</th>
              <th className="py-3 px-4 text-left">Hãng</th>
              <th className="py-3 px-4 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-sm font-mono text-gray-500">{product._id}</td>
                <td className="py-3 px-4 font-semibold">{product.name}</td>
                <td className="py-3 px-4">{product.price.toLocaleString('vi-VN')} đ</td>
                <td className="py-3 px-4">{product.category}</td>
                <td className="py-3 px-4">{product.brand}</td>
                <td className="py-3 px-4 flex gap-2">
                  <Link 
                    to={`/admin/product/${product._id}/edit`} 
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    Sửa
                  </Link>
                  <button 
                    onClick={() => deleteHandler(product._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Thêm thanh phân trang cho Admin */}
      <div className="mt-4">
        <Paginate pages={pages} page={page} isAdmin={true} />
      </div>
    </div>
  );
};

export default AdminProductList;
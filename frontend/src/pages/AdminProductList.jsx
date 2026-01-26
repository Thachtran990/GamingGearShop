import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    // Kiểm tra quyền Admin
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo || !userInfo.isAdmin) {
      alert("Bạn không có quyền truy cập trang này!");
      navigate("/"); // Đuổi về trang chủ
    } else {
      fetchProducts();
    }
  }, [navigate]);

  // Hàm xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("Đã xóa thành công!");
          fetchProducts(); // Load lại danh sách
        } else {
          alert("Lỗi khi xóa");
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

      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">Tên</th>
            <th className="py-3 px-4 text-left">Giá</th>
            <th className="py-3 px-4 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 text-sm font-mono">{product._id}</td>
              <td className="py-3 px-4 font-semibold">{product.name}</td>
              <td className="py-3 px-4">{product.price.toLocaleString('vi-VN')} đ</td>
              <td className="py-3 px-4 space-x-2">
                <Link 
                  to={`/admin/product/${product._id}/edit`} 
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Sửa
                </Link>
                <button 
                  onClick={() => handleDelete(product._id)}
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
  );
};

export default AdminProductList;
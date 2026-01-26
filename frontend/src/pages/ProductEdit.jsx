import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const ProductEdit = () => {
  const { id } = useParams(); // Lấy ID sản phẩm cần sửa
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    image: "",
    brand: "",
    category: "",
    description: "",
  });

  // 1. Vừa vào trang là lấy thông tin cũ điền vào form ngay
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        
        // Điền dữ liệu cũ vào Form
        setFormData({
          name: data.name,
          price: data.price,
          image: data.image,
          brand: data.brand,
          category: data.category,
          description: data.description,
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT", // Gửi lệnh PUT để cập nhật
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Cập nhật thành công!");
        navigate("/admin/productlist");
      } else {
        alert("Lỗi cập nhật");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-yellow-600">SỬA SẢN PHẨM</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tên sản phẩm</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Giá (VNĐ)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Link Ảnh</label>
          <input type="text" name="image" value={formData.image} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Thương hiệu</label>
          <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Danh mục</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Mô tả</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" rows="3"></textarea>
        </div>

        <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 font-bold">
          CẬP NHẬT
        </button>
        
        <Link to="/admin/productlist" className="block text-center mt-4 text-gray-500 hover:underline">
          Hủy bỏ
        </Link>
      </form>
    </div>
  );
};

export default ProductEdit;
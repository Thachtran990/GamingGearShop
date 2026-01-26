import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProductAdd = () => {
    const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    brand: "", // <--- Thêm dòng này
    description: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Thêm sản phẩm thành công!");
        navigate("/admin/productlist"); // Quay về danh sách
      } else {
        alert("Lỗi khi thêm sản phẩm");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">THÊM SẢN PHẨM MỚI</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tên sản phẩm</label>
          <input type="text" name="name" onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Giá (VNĐ)</label>
          <input type="number" name="price" onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Link Ảnh (URL)</label>
          <input 
            type="text" 
            name="image" 
            onChange={handleChange} 
            placeholder="https://example.com/anh-san-pham.jpg"
            className="w-full p-2 border rounded" 
            required 
          />
          <p className="text-xs text-gray-500 mt-1">*Copy địa chỉ hình ảnh trên mạng dán vào đây</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Danh mục</label>
          <input type="text" name="category" onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Thương hiệu</label>
            <input 
              type="text" 
              name="brand" 
              placeholder="VD: Logitech, Razer..."
              onChange={handleChange} 
              className="w-full p-2 border rounded" 
              required 
            />
      </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Mô tả</label>
          <textarea name="description" onChange={handleChange} className="w-full p-2 border rounded" rows="3"></textarea>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          LƯU SẢN PHẨM
        </button>
      </form>
    </div>
  );
};

export default ProductAdd;
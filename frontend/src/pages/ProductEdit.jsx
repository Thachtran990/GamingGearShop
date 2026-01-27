import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios"; // Dùng axios để xử lý upload và request gọn hơn

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. State thông tin chung
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    brand: "",
    category: "",
    description: "",
    price: 0,          // Giá (cho SP đơn giản)
    countInStock: 0,   // Kho (cho SP đơn giản)
  });

  // 2. State biến thể & Upload
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);
  const [uploading, setUploading] = useState(false);

  // --- LẤY DỮ LIỆU CŨ TỪ SERVER ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        
        // Điền dữ liệu vào form
        setFormData({
          name: data.name,
          image: data.image,
          brand: data.brand,
          category: data.category,
          description: data.description,
          price: data.price || 0,
          countInStock: data.countInStock || 0,
        });

        // Điền dữ liệu biến thể (Nếu có)
        setHasVariants(data.hasVariants || false);
        setVariants(data.variants || []);
        
      } catch (error) {
        console.error(error);
        alert("Không tìm thấy sản phẩm");
      }
    };
    fetchProduct();
  }, [id]);

  // --- HÀM XỬ LÝ NHẬP LIỆU CHUNG ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- HÀM UPLOAD ẢNH (Copy từ trang Add) ---
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const dataPayload = new FormData();
    dataPayload.append("image", file);
    setUploading(true);

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      const { data } = await axios.post("/api/upload", dataPayload, config);
      
      setFormData((prev) => ({ ...prev, image: data.image }));
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert("Lỗi upload ảnh!");
    }
  };

  // --- LOGIC BIẾN THỂ (Thêm/Sửa/Xóa) ---
  const addVariantHandler = () => {
    setVariants([...variants, { price: 0, countInStock: 0, attributes: [{ k: "", v: "" }] }]);
  };

  const removeVariantHandler = (index) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addAttributeHandler = (vIndex) => {
    const newVariants = [...variants];
    newVariants[vIndex].attributes.push({ k: "", v: "" });
    setVariants(newVariants);
  };

  const removeAttributeHandler = (vIndex, aIndex) => {
    const newVariants = [...variants];
    newVariants[vIndex].attributes.splice(aIndex, 1);
    setVariants(newVariants);
  };

  const handleAttributeChange = (vIndex, aIndex, field, value) => {
    const newVariants = [...variants];
    newVariants[vIndex].attributes[aIndex][field] = value;
    setVariants(newVariants);
  };

  // --- SUBMIT CẬP NHẬT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Gom dữ liệu
    const finalProductData = {
      ...formData,
      hasVariants,
      variants: hasVariants ? variants : [],
    };

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      await axios.put(`/api/products/${id}`, finalProductData, {
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}` // Cần Token admin
        },
      });

      alert("Cập nhật thành công!");
      navigate("/admin/productlist");
    } catch (error) {
      console.error(error);
      alert("Lỗi cập nhật: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-3xl font-bold mb-8 text-center text-yellow-600 uppercase">SỬA SẢN PHẨM</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CỘT TRÁI */}
          <div>
            <div className="mb-4">
              <label className="font-bold block mb-1">Tên sản phẩm</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>

            <div className="mb-4">
              <label className="font-bold block mb-1">Danh mục</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>

            <div className="mb-4">
              <label className="font-bold block mb-1">Thương hiệu</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>

            {/* UPLOAD ẢNH */}
            <div className="mb-4">
              <label className="font-bold block mb-1">Hình ảnh</label>
              
              {/* Input Link (Readonly) */}
              <input 
                type="text" 
                name="image" 
                value={formData.image} 
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-50 mb-2 text-sm text-gray-500" 
                placeholder="Link ảnh..."
              />
              
              {/* Input File */}
              <input type="file" onChange={uploadFileHandler} className="text-sm" />
              {uploading && <span className="text-blue-500 text-sm ml-2">Đang tải ảnh...</span>}
              
              {/* Preview */}
              {formData.image && (
                <div className="mt-2">
                    <img src={formData.image} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div>
            <div className="mb-4">
              <label className="font-bold block mb-1">Mô tả</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded h-32"></textarea>
            </div>

            {/* CHECKBOX BIẾN THỂ */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="flex items-center cursor-pointer gap-3">
                <input 
                  type="checkbox" 
                  checked={hasVariants} 
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="w-5 h-5 text-yellow-600"
                />
                <span className="font-bold text-gray-800">Sản phẩm có nhiều biến thể?</span>
              </label>
            </div>

            {/* NẾU KHÔNG CÓ BIẾN THỂ -> HIỆN GIÁ/KHO CHUNG */}
            {!hasVariants && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="font-bold block mb-1">Giá bán (VNĐ)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded font-bold text-red-600" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Kho (Tồn)</label>
                  <input type="number" name="countInStock" value={formData.countInStock} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- KHU VỰC BIẾN THỂ (HIỆN KHI CHECKBOX ĐƯỢC CHỌN) --- */}
        {hasVariants && (
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Chi tiết Biến thể</h3>
              <button 
                type="button"
                onClick={addVariantHandler}
                className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 flex items-center gap-2 shadow"
              >
                <span>➕ Thêm dòng mới</span>
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="border-2 border-blue-100 rounded-lg p-4 bg-blue-50 relative">
                  
                  {/* Nút xóa biến thể */}
                  <button 
                    type="button" 
                    onClick={() => removeVariantHandler(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                  >
                    🗑️ Xóa
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Giá & Kho riêng */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-600">Giá riêng</label>
                        <input type="number" value={variant.price} onChange={(e) => handleVariantChange(index, "price", e.target.value)} className="w-full p-2 border rounded" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-600">Kho riêng</label>
                        <input type="number" value={variant.countInStock} onChange={(e) => handleVariantChange(index, "countInStock", e.target.value)} className="w-full p-2 border rounded" />
                      </div>
                    </div>

                    {/* Thuộc tính */}
                    <div className="bg-white p-3 rounded border">
                      <label className="text-xs font-bold text-gray-600 mb-2 block">Đặc điểm (Thuộc tính)</label>
                      
                      {variant.attributes.map((attr, attrIndex) => (
                        <div key={attrIndex} className="flex gap-2 mb-2 items-center">
                          <input type="text" placeholder="Tên (VD: Màu)" value={attr.k} onChange={(e) => handleAttributeChange(index, attrIndex, "k", e.target.value)} className="w-1/3 p-1 border rounded text-sm bg-gray-50" />
                          <input type="text" placeholder="Giá trị (VD: Đen)" value={attr.v} onChange={(e) => handleAttributeChange(index, attrIndex, "v", e.target.value)} className="w-1/3 p-1 border rounded text-sm font-bold" />
                          <button type="button" onClick={() => removeAttributeHandler(index, attrIndex)} className="text-red-400 hover:text-red-600">×</button>
                        </div>
                      ))}
                      
                      <button type="button" onClick={() => addAttributeHandler(index)} className="text-xs text-blue-600 hover:underline mt-1">
                        + Thêm đặc điểm
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t flex gap-4">
          <button type="submit" className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 shadow transition transform hover:scale-[1.01]">
            CẬP NHẬT SẢN PHẨM
          </button>
          
          <Link to="/admin/productlist" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 font-bold flex items-center justify-center">
             Hủy bỏ
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
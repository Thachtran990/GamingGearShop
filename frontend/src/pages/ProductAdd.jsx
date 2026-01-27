import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProductAdd = () => {
  // 1. State cho thông tin chung
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    category: "",
    brand: "",
    description: "",
    price: 0,          // Dùng cho SP đơn giản
    countInStock: 0,   // Dùng cho SP đơn giản
  });

  // 2. State quản lý biến thể
  const [hasVariants, setHasVariants] = useState(false); // Checkbox bật/tắt chế độ biến thể
  const [variants, setVariants] = useState([]); 

  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // --- HÀM XỬ LÝ NHẬP LIỆU CHUNG ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- HÀM UPLOAD ẢNH (Giữ nguyên) ---
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

  // --- LOGIC XỬ LÝ BIẾN THỂ (PHỨC TẠP) ---

  // Thêm một dòng biến thể mới (VD: Thêm 1 con chuột màu đen)
  const addVariantHandler = () => {
    setVariants([
      ...variants,
      { 
        price: 0, 
        countInStock: 0, 
        attributes: [{ k: "", v: "" }] // Mặc định có sẵn 1 thuộc tính trống
      }
    ]);
  };

  // Xóa biến thể
  const removeVariantHandler = (index) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  // Sửa Giá/Kho của biến thể
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  // --- LOGIC XỬ LÝ THUỘC TÍNH (COLOR, SIZE...) ---

  // Thêm thuộc tính cho 1 biến thể cụ thể (VD: Đã có Màu, thêm Size)
  const addAttributeHandler = (variantIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].attributes.push({ k: "", v: "" });
    setVariants(newVariants);
  };

  // Sửa Tên/Giá trị thuộc tính (VD: k="Màu", v="Đỏ")
  const handleAttributeChange = (variantIndex, attrIndex, field, value) => {
    const newVariants = [...variants];
    newVariants[variantIndex].attributes[attrIndex][field] = value;
    setVariants(newVariants);
  };

  // Xóa thuộc tính
  const removeAttributeHandler = (variantIndex, attrIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].attributes.splice(attrIndex, 1);
    setVariants(newVariants);
  };

  // --- SUBMIT FORM ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Gom dữ liệu chuẩn bị gửi
    const finalProductData = {
      ...formData,
      hasVariants,
      variants: hasVariants ? variants : [], // Nếu chọn simple thì gửi mảng rỗng
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalProductData),
      });

      if (res.ok) {
        alert("Thêm sản phẩm thành công!");
        navigate("/admin/productlist");
      } else {
        alert("Lỗi khi thêm sản phẩm");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-800">THÊM SẢN PHẨM MỚI</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
          <div>
            <div className="mb-4">
              <label className="font-bold block mb-1">Tên sản phẩm</label>
              <input type="text" name="name" onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            
            <div className="mb-4">
              <label className="font-bold block mb-1">Danh mục</label>
              <input type="text" name="category" onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>

            <div className="mb-4">
              <label className="font-bold block mb-1">Thương hiệu</label>
              <input type="text" name="brand" onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>

            <div className="mb-4">
              <label className="font-bold block mb-1">Hình ảnh</label>
              <input type="text" value={formData.image} readOnly className="w-full p-2 border rounded bg-gray-50 mb-2 text-sm" placeholder="Link ảnh..." />
              <input type="file" onChange={uploadFileHandler} className="text-sm" />
              {uploading && <span className="text-blue-500 text-sm ml-2">Đang upload...</span>}
              {formData.image && <img src={formData.image} alt="Preview" className="h-20 mt-2 rounded border" />}
            </div>
          </div>

          {/* CỘT PHẢI: GIÁ & BIẾN THỂ */}
          <div>
            <div className="mb-4">
              <label className="font-bold block mb-1">Mô tả chi tiết</label>
              <textarea name="description" onChange={handleChange} className="w-full p-2 border rounded h-32"></textarea>
            </div>

            {/* --- CHECKBOX QUAN TRỌNG --- */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="flex items-center cursor-pointer gap-3">
                <input 
                  type="checkbox" 
                  checked={hasVariants} 
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="font-bold text-gray-800">Sản phẩm này có nhiều biến thể?</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-8">
                (Ví dụ: Màu sắc, Size, Switch, Dung lượng...)
              </p>
            </div>

            {/* --- TRƯỜNG HỢP 1: SẢN PHẨM ĐƠN GIẢN --- */}
            {!hasVariants && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="font-bold block mb-1">Giá bán (VNĐ)</label>
                  <input type="number" name="price" onChange={handleChange} className="w-full p-2 border rounded font-bold text-red-600" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Kho (Tồn)</label>
                  <input type="number" name="countInStock" onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- TRƯỜNG HỢP 2: SẢN PHẨM BIẾN THỂ (PHẦN KHÓ NHẤT) --- */}
        {hasVariants && (
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Danh sách Biến thể</h3>
              <button 
                type="button"
                onClick={addVariantHandler}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 shadow"
              >
                <span>➕ Thêm biến thể mới</span>
              </button>
            </div>

            {variants.length === 0 && <p className="text-center text-gray-500 italic">Chưa có biến thể nào. Hãy bấm nút Thêm.</p>}

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="border-2 border-blue-100 rounded-lg p-4 bg-blue-50 relative">
                  
                  {/* Nút xóa biến thể */}
                  <button 
                    type="button" 
                    onClick={() => removeVariantHandler(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                  >
                    🗑️ Xóa dòng này
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Cột nhập Giá & Kho riêng */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-600">Giá riêng</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-600">Kho riêng</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={variant.countInStock}
                          onChange={(e) => handleVariantChange(index, "countInStock", e.target.value)}
                          className="w-full p-2 border rounded" 
                        />
                      </div>
                    </div>

                    {/* Cột nhập Thuộc tính (Dynamic Attributes) */}
                    <div className="bg-white p-3 rounded border">
                      <label className="text-xs font-bold text-gray-600 mb-2 block">Đặc điểm (Thuộc tính)</label>
                      
                      {variant.attributes.map((attr, attrIndex) => (
                        <div key={attrIndex} className="flex gap-2 mb-2 items-center">
                          <input 
                            type="text" 
                            placeholder="Tên (VD: Màu)" 
                            value={attr.k}
                            onChange={(e) => handleAttributeChange(index, attrIndex, "k", e.target.value)}
                            className="w-1/3 p-1 border rounded text-sm bg-gray-50"
                          />
                          <input 
                            type="text" 
                            placeholder="Giá trị (VD: Đen)" 
                            value={attr.v}
                            onChange={(e) => handleAttributeChange(index, attrIndex, "v", e.target.value)}
                            className="w-1/3 p-1 border rounded text-sm font-bold"
                          />
                          {/* Nút xóa thuộc tính nhỏ */}
                          <button type="button" onClick={() => removeAttributeHandler(index, attrIndex)} className="text-red-400 hover:text-red-600">×</button>
                        </div>
                      ))}
                      
                      <button 
                        type="button" 
                        onClick={() => addAttributeHandler(index)}
                        className="text-xs text-blue-600 hover:underline mt-1"
                      >
                        + Thêm đặc điểm khác
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t">
          <button type="submit" className="w-full bg-blue-700 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-800 shadow-lg transition transform hover:scale-[1.01]">
            LƯU SẢN PHẨM HOÀN TẤT
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductAdd;
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", image: "", category: "", brand: "", description: "", price: 0, countInStock: 0,
  });

  const [galleryImages, setGalleryImages] = useState([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setFormData({
          name: data.name, image: data.image, category: data.category, brand: data.brand, description: data.description, price: data.price, countInStock: data.countInStock,
        });
        setGalleryImages(data.images || []);
        setHasVariants(data.hasVariants);
        setVariants(data.variants || []);
      } catch (error) { console.error(error); }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const uploadMainImageHandler = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const dataPayload = new FormData(); dataPayload.append("image", file); setUploading(true);
    try {
      const { data } = await axios.post("/api/upload", dataPayload, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData((prev) => ({ ...prev, image: data.image })); setUploading(false);
    } catch (error) { console.error(error); setUploading(false); }
  };

  const uploadGalleryHandler = async (e) => {
    const files = e.target.files; if (files.length === 0) return;
    const dataPayload = new FormData();
    for (let i = 0; i < files.length; i++) { dataPayload.append('images', files[i]); }
    setUploading(true);
    try {
      const { data } = await axios.post("/api/upload/multiple", dataPayload, { headers: { "Content-Type": "multipart/form-data" } });
      setGalleryImages(prev => [...prev, ...data.images]); setUploading(false);
    } catch (error) { console.error(error); setUploading(false); alert("Lỗi upload album!"); }
  };

  const removeGalleryImage = (indexToRemove) => {
    setGalleryImages(galleryImages.filter((_, index) => index !== indexToRemove));
  };

  // --- LOGIC BIẾN THỂ ---
  const addVariantHandler = () => setVariants([...variants, { price: 0, countInStock: 0, image: "", attributes: [{ k: "", v: "" }] }]);
  const removeVariantHandler = (i) => { const newV = [...variants]; newV.splice(i, 1); setVariants(newV); };
  const handleVariantChange = (i, f, v) => { const newV = [...variants]; newV[i][f] = v; setVariants(newV); };
  const addAttributeHandler = (i) => { const newV = [...variants]; newV[i].attributes.push({ k: "", v: "" }); setVariants(newV); };
  const removeAttributeHandler = (i, j) => { const newV = [...variants]; newV[i].attributes.splice(j, 1); setVariants(newV); };
  const handleAttributeChange = (i, j, f, v) => { const newV = [...variants]; newV[i].attributes[j][f] = v; setVariants(newV); };

  // 👇 CHỌN ẢNH TỪ GALLERY
  const selectImageForVariant = (variantIndex, imgUrl) => {
    const newV = [...variants];
    newV[variantIndex].image = imgUrl;
    setVariants(newV);
  };

  const uploadVariantImageHandler = async (index, e) => {
    const file = e.target.files[0]; if (!file) return;
    const dataPayload = new FormData(); dataPayload.append("image", file); setUploading(true);
    try {
      const { data } = await axios.post("/api/upload", dataPayload, { headers: { "Content-Type": "multipart/form-data" } });
      const newVariants = [...variants]; newVariants[index].image = data.image; setVariants(newVariants); setUploading(false);
    } catch (error) { console.error(error); setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalProductData = {
      ...formData,
      images: galleryImages,
      hasVariants,
      variants: hasVariants ? variants : [],
    };
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      await axios.put(`/api/products/${id}`, finalProductData, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}` },
      });
      alert("Cập nhật sản phẩm thành công!");
      navigate("/admin/productlist");
    } catch (error) { console.error(error); alert("Lỗi cập nhật: " + (error.response?.data?.message || error.message)); }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-5xl">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-800">CẬP NHẬT SẢN PHẨM</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CỘT TRÁI */}
          <div>
            <div className="mb-4"><label className="font-bold block mb-1">Tên sản phẩm</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
            <div className="mb-4"><label className="font-bold block mb-1">Danh mục</label><input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
            <div className="mb-4"><label className="font-bold block mb-1">Thương hiệu</label><input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full p-2 border rounded" required /></div>

            <div className="mb-6 bg-blue-50 p-4 rounded border border-blue-200">
              <label className="font-bold block mb-2 text-blue-800">① Ảnh đại diện chính</label>
              <input type="file" onChange={uploadMainImageHandler} className="text-sm block w-full mb-2" />
              {uploading && !formData.image && <span className="text-blue-500 text-sm animate-pulse">Đang upload...</span>}
              {formData.image && <img src={formData.image} alt="Main Preview" className="h-40 w-full object-contain rounded border bg-white shadow-sm" />}
            </div>

            <div className="mb-4 bg-green-50 p-4 rounded border border-green-200">
              <label className="font-bold block mb-2 text-green-800">② Album ảnh chi tiết</label>
              <input type="file" multiple onChange={uploadGalleryHandler} className="text-sm block w-full mb-2" />

              {galleryImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {galleryImages.map((imgUrl, index) => (
                    <div key={index} className="relative group">
                      <img src={imgUrl} alt={`Gallery ${index}`} className="h-20 w-full object-cover rounded border bg-white" />
                      <button type="button" onClick={() => removeGalleryImage(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div>
            <div className="mb-4"><label className="font-bold block mb-1">Mô tả chi tiết</label><textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded h-32"></textarea></div>
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"><label className="flex items-center cursor-pointer gap-3"><input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} className="w-5 h-5 text-blue-600" /><span className="font-bold text-gray-800">Sản phẩm có nhiều biến thể?</span></label></div>
            {!hasVariants && (<div className="grid grid-cols-2 gap-4 animate-fade-in"><div><label className="font-bold block mb-1">Giá bán</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded font-bold text-red-600" /></div><div><label className="font-bold block mb-1">Kho</label><input type="number" name="countInStock" value={formData.countInStock} onChange={handleChange} className="w-full p-2 border rounded" /></div></div>)}
          </div>
        </div>

        {/* --- KHU VỰC BIẾN THỂ (GIAO DIỆN MỚI) --- */}
        {hasVariants && (
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-800">Chi tiết Biến thể</h3><button type="button" onClick={addVariantHandler} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 shadow"><span>➕ Thêm biến thể mới</span></button></div>

            <div className="space-y-6">
              {variants.map((variant, index) => (
                <div key={index} className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 relative shadow-sm">
                  <button type="button" onClick={() => removeVariantHandler(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">×</button>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div><label className="text-xs font-bold">Giá</label><input type="number" value={variant.price} onChange={(e) => handleVariantChange(index, "price", e.target.value)} className="w-full p-2 border rounded" /></div>
                      <div><label className="text-xs font-bold">Kho</label><input type="number" value={variant.countInStock} onChange={(e) => handleVariantChange(index, "countInStock", e.target.value)} className="w-full p-2 border rounded" /></div>
                    </div>

                    {/* Cột 2: CHỌN TỪ GALLERY */}
                    <div className="bg-white p-3 rounded border">
                      <label className="text-xs font-bold block mb-2 text-blue-800">Chọn ảnh minh họa:</label>

                      {/* Ảnh đang được chọn */}
                      <div className="mb-2 text-center">
                        {variant.image ? (
                          <img src={variant.image} alt="Selected" className="h-24 mx-auto object-contain rounded border border-blue-500 shadow-sm" />
                        ) : (
                          <div className="h-24 border-2 border-dashed flex items-center justify-center text-xs text-gray-400">Chưa chọn ảnh</div>
                        )}
                      </div>

                      {/* KHU VỰC CHỌN ẢNH (GỘP CẢ ẢNH CHÍNH + GALLERY) */}
                      <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto p-1 border-t">

                        {/* 1. Luôn hiện Ảnh đại diện chính đầu tiên để chọn */}
                        {formData.image && (
                          <div className="relative group cursor-pointer" onClick={() => selectImageForVariant(index, formData.image)}>
                            <img
                              src={formData.image}
                              className={`h-10 w-full object-cover rounded hover:opacity-80 transition-all 
                        ${variant.image === formData.image ? 'border-2 border-red-500 ring-1 ring-red-300' : 'border border-red-200'}`}
                              title="Ảnh đại diện chính"
                            />
                            {/* Nhãn nhỏ đánh dấu đây là ảnh chính */}
                            <span className="absolute bottom-0 right-0 bg-red-600 text-white text-[8px] px-1 rounded-tl">MAIN</span>
                          </div>
                        )}

                        {/* 2. Tiếp theo là danh sách Gallery */}
                        {galleryImages.map((imgUrl, gIdx) => (
                          // Chỉ hiện nếu ảnh này KHÁC ảnh chính (để tránh hiển thị 2 lần nếu lỡ upload trùng)
                          imgUrl !== formData.image && (
                            <img
                              key={gIdx}
                              src={imgUrl}
                              onClick={() => selectImageForVariant(index, imgUrl)}
                              className={`h-10 w-full object-cover rounded cursor-pointer hover:opacity-80 transition-all 
                        ${variant.image === imgUrl ? 'border-2 border-blue-600 ring-1 ring-blue-300' : 'border border-gray-200'}`}
                              title="Ảnh từ Album"
                            />
                          )
                        ))}
                      </div>

                      {/* Nếu chưa có ảnh nào cả */}
                      {!formData.image && galleryImages.length === 0 && (
                        <p className="text-xs text-red-500 italic mt-1">⚠️ Chưa có ảnh nào để chọn.</p>
                      )}

                      {/* Fallback upload riêng */}
                      <div className="mt-2 pt-2 border-t">
                        <label className="text-[10px] text-gray-500">Hoặc upload ảnh riêng:</label>
                        <input type="file" onChange={(e) => uploadVariantImageHandler(index, e)} className="text-[10px] block w-full" />
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <label className="text-xs font-bold text-gray-600 mb-2 block">Đặc điểm</label>
                      {variant.attributes.map((attr, attrIndex) => (<div key={attrIndex} className="flex gap-2 mb-2 items-center"><input type="text" placeholder="Tên" value={attr.k} onChange={(e) => handleAttributeChange(index, attrIndex, "k", e.target.value)} className="w-1/3 p-1 border rounded text-sm bg-gray-50" /><input type="text" placeholder="Giá trị" value={attr.v} onChange={(e) => handleAttributeChange(index, attrIndex, "v", e.target.value)} className="w-1/3 p-1 border rounded text-sm font-bold" /><button type="button" onClick={() => removeAttributeHandler(index, attrIndex)} className="text-red-400 hover:text-red-600">×</button></div>))}
                      <button type="button" onClick={() => addAttributeHandler(index)} className="text-xs text-blue-600 hover:underline mt-1">+ Thêm đặc điểm</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t">
          <button type="submit" disabled={uploading} className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 text-white'}`}>
            {uploading ? 'ĐANG XỬ LÝ...' : 'CẬP NHẬT SẢN PHẨM'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
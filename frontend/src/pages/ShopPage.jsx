import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ShopPage = () => {
  const { addToCart } = useCart();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const [filterConfig, setFilterConfig] = useState({ categories: [], brands: [], maxPrice: 0 });

  // 👇 STATE THAY ĐỔI: category quay về String "All", brand giữ nguyên Array []
  const [filters, setFilters] = useState({
    category: "All", 
    brand: [],
    minPrice: 0,
    maxPrice: 0,
    sort: "newest"
  });

  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";

  // Reset bộ lọc khi đổi từ khóa
  useEffect(() => {
    setFilters({ category: "All", brand: [], minPrice: 0, maxPrice: 0, sort: "newest" });
  }, [keyword]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        if (keyword) params.append("keyword", keyword);
        
        // 👇 CATEGORY: Gửi 1 giá trị (String)
        if (filters.category !== "All") params.append("category", filters.category);
        
        // 👇 BRAND: Gửi nhiều giá trị (Array -> String join by comma)
        if (filters.brand.length > 0) params.append("brand", filters.brand.join(","));
        
        if (filters.maxPrice > 0) {
            params.append("minPrice", filters.minPrice);
            params.append("maxPrice", filters.maxPrice);
        }
        params.append("sort", filters.sort);

        const { data } = await axios.get(`/api/products?${params.toString()}`);
        
        setProducts(data.products);
        setTotalProducts(data.totalProduct || data.products.length);

        if (data.filterOptions) {
            setFilterConfig({
                categories: data.filterOptions.categories.filter(c => c !== "All"),
                brands: data.filterOptions.brands.filter(b => b !== "All"),
                maxPrice: data.filterOptions.maxPrice
            });
            // Chỉ set max price lần đầu hoặc khi chưa có
            if (filters.maxPrice === 0) {
                setFilters(prev => ({ ...prev, maxPrice: data.filterOptions.maxPrice }));
            }
        }
      } catch (error) { console.error(error); }
      setLoading(false);
    };

    const timeout = setTimeout(() => { fetchProducts(); }, 300);
    return () => clearTimeout(timeout);
  }, [filters, keyword]);

  // 👇 XỬ LÝ CHỌN DANH MỤC (RADIO - CHỈ 1)
  const handleCategoryChange = (cat) => {
      // Khi đổi danh mục, ta reset luôn thương hiệu để tránh bị lọc sai (VD: Đang chọn Hãng Nike mà chuyển sang danh mục Chuột thì vô lý)
      setFilters(prev => ({ ...prev, category: cat, brand: [] }));
  };

  // 👇 XỬ LÝ CHỌN THƯƠNG HIỆU (CHECKBOX - NHIỀU)
  const handleBrandChange = (brand) => {
    setFilters(prev => {
        const currentList = prev.brand;
        if (currentList.includes(brand)) {
            return { ...prev, brand: currentList.filter(item => item !== brand) };
        } else {
            return { ...prev, brand: [...currentList, brand] };
        }
    });
  };

  const handlePriceChange = (value) => {
      setFilters(prev => ({ ...prev, maxPrice: value }));
  };

  const handleSortChange = (value) => {
      setFilters(prev => ({ ...prev, sort: value }));
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="mb-6">
          {keyword ? (
              <h1 className="text-2xl font-bold text-gray-800">Kết quả tìm kiếm: <span className="text-blue-600">"{keyword}"</span></h1>
          ) : (
              <h1 className="text-3xl font-bold text-center text-gray-800 uppercase">Cửa hàng Gaming Gear</h1>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* SIDEBAR BỘ LỌC */}
        <div className="bg-white p-4 rounded-lg shadow h-fit border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="font-bold text-lg flex items-center gap-2">🌪️ Bộ Lọc</h2>
            <button 
                onClick={() => setFilters({ category: "All", brand: [], minPrice: 0, maxPrice: filterConfig.maxPrice, sort: "newest" })}
                className="text-xs text-red-500 hover:underline"
            >
                Xóa tất cả
            </button>
          </div>
          
          {/* 1. Danh mục (RADIO BUTTON) */}
          <div className="mb-6">
            <label className="font-bold block mb-2 text-sm text-gray-800">Danh mục</label>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {/* Option Tất cả */}
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded select-none">
                    <input 
                        type="radio" 
                        name="category"
                        checked={filters.category === "All"}
                        onChange={() => handleCategoryChange("All")}
                        className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className={`text-sm ${filters.category === "All" ? 'font-bold text-blue-600' : 'text-gray-600'}`}>Tất cả</span>
                </label>

                {filterConfig.categories.length > 0 ? filterConfig.categories.map(cat => (
                    <label key={cat} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded select-none">
                        <input 
                            type="radio" 
                            name="category"
                            checked={filters.category === cat}
                            onChange={() => handleCategoryChange(cat)}
                            className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className={`text-sm ${filters.category === cat ? 'font-bold text-blue-600' : 'text-gray-600'}`}>{cat}</span>
                    </label>
                )) : null}
            </div>
          </div>

          {/* 2. Thương hiệu (CHECKBOX) */}
          <div className="mb-6">
            <label className="font-bold block mb-2 text-sm text-gray-800">Thương hiệu</label>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {filterConfig.brands.length > 0 ? filterConfig.brands.map(brand => (
                    <label key={brand} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded select-none">
                        <input 
                            type="checkbox" 
                            checked={filters.brand.includes(brand)}
                            onChange={() => handleBrandChange(brand)}
                            className="form-checkbox text-blue-600 rounded focus:ring-blue-500 h-4 w-4"
                        />
                        <span className={`text-sm ${filters.brand.includes(brand) ? 'font-bold text-blue-600' : 'text-gray-600'}`}>{brand}</span>
                    </label>
                )) : <p className="text-xs text-gray-400 italic">Không có thương hiệu phù hợp.</p>}
            </div>
          </div>

          {/* 3. Khoảng giá */}
          <div className="mb-6">
            <label className="font-bold block mb-2 text-sm text-gray-800">
                Giá tối đa: <span className="text-blue-600 font-bold">{filters.maxPrice?.toLocaleString()} đ</span>
            </label>
            <input 
                type="range" min="0" max={filterConfig.maxPrice || 10000000} step="100000"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 đ</span><span>{filterConfig.maxPrice?.toLocaleString()} đ</span>
            </div>
          </div>
        </div>

        {/* KẾT QUẢ SẢN PHẨM */}
        <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-6 bg-white p-3 rounded shadow-sm border border-gray-100">
                <p className="text-sm text-gray-600">Tìm thấy <strong>{totalProducts}</strong> sản phẩm</p>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sắp xếp:</span>
                    <select value={filters.sort} onChange={(e) => handleSortChange(e.target.value)} className="p-1 border rounded text-sm outline-none bg-gray-50">
                        <option value="newest">Mới nhất</option>
                        <option value="price_asc">Giá tăng dần</option>
                        <option value="price_desc">Giá giảm dần</option>
                        <option value="top_rated">Đánh giá cao</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 h-64 rounded-lg animate-pulse"></div>)}</div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào.</p>
                    <button onClick={() => setFilters({ category: "All", brand: [], minPrice: 0, maxPrice: filterConfig.maxPrice, sort: "newest" })} className="mt-4 text-blue-600 hover:underline">Xóa bộ lọc</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white border rounded-lg overflow-hidden hover:shadow-xl transition duration-300 group flex flex-col">
                            <Link to={`/product/${product._id}`} className="block relative overflow-hidden bg-gray-50 h-56 flex items-center justify-center">
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply" />
                            </Link>
                            <div className="p-4 flex flex-col flex-1">
                                <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
                                <Link to={`/product/${product._id}`}><h3 className="text-md font-bold text-gray-800 line-clamp-2 hover:text-blue-600 transition min-h-[48px]">{product.name}</h3></Link>
                                <div className="flex items-center my-2"><span className="text-yellow-400 text-sm">{"⭐".repeat(Math.round(product.rating))}</span><span className="text-gray-300 text-xs ml-1">({product.numReviews})</span></div>
                                <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-100">
                                    <span className="text-red-600 font-bold text-lg">{product.price.toLocaleString('vi-VN')} đ</span>
                                    <button onClick={() => { addToCart(product, 1); alert("Đã thêm vào giỏ!"); }} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow transition transform active:scale-95 text-xs font-bold">THÊM</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
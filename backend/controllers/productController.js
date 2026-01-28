const Product = require("../models/productModel.js");

// @desc    Lấy sản phẩm + Bộ lọc thông minh (Smart Filter)
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    // 1. TẠO QUERY CHO TÌM KIẾM (Keyword)
    // Đây là điều kiện gốc. Bộ lọc sẽ dựa trên tập kết quả của cái này.
    const keywordQuery = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};

    // 2. TÍNH TOÁN BỘ LỌC ĐỘNG (AGGREGATION)
    // Chúng ta chạy thống kê trên tập dữ liệu khớp với Keyword
    // Để tìm ra: Có những Hãng nào? Danh mục nào? Giá cao nhất là bao nhiêu?
    // trong tập kết quả đó.
    const facets = await Product.aggregate([
      { $match: keywordQuery }, // Chỉ lấy những sp khớp từ khóa
      {
        $facet: {
          // Lấy danh sách danh mục duy nhất
          uniqueCategories: [{ $group: { _id: "$category" } }],
          // Lấy danh sách thương hiệu duy nhất
          uniqueBrands: [{ $group: { _id: "$brand" } }],
          // Tìm giá cao nhất
          maxPrice: [{ $group: { _id: null, max: { $max: "$price" } } }]
        }
      }
    ]);

    // Xử lý kết quả Aggregation cho gọn
    const availableCategories = facets[0].uniqueCategories.map(x => x._id).filter(Boolean);
    const availableBrands = facets[0].uniqueBrands.map(x => x._id).filter(Boolean);
    const maxPriceAvailable = facets[0].maxPrice.length > 0 ? facets[0].maxPrice[0].max : 0;

    // 3. TẠO QUERY CHO VIỆC LỌC SẢN PHẨM CUỐI CÙNG (Áp dụng checkbox user chọn)
    // Xử lý Danh mục (Category) - Cho phép nhiều danh mục
    let categoryQuery = {};
    if (req.query.category && req.query.category !== "All") {
      // Tách chuỗi bằng dấu phẩy thành mảng: "Mouse,Keyboard" -> ["Mouse", "Keyboard"]
      const categories = req.query.category.split(",");
      categoryQuery = { category: { $in: categories } }; // $in là phép toán tìm "trong danh sách này"
    }

    // Xử lý Thương hiệu (Brand) - Cho phép nhiều thương hiệu
    let brandQuery = {};
    if (req.query.brand && req.query.brand !== "All") {
      const brands = req.query.brand.split(",");
      brandQuery = { brand: { $in: brands } };
    }

    // Xử lý Giá
    const priceFilter = {};
    if (req.query.minPrice || req.query.maxPrice) {
      priceFilter.price = {};
      if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
    }

    // Tổng hợp query cuối cùng
    const finalQuery = { ...keywordQuery, ...categoryQuery, ...brandQuery, ...priceFilter };

    // Xử lý sắp xếp
    let sortOption = { createdAt: -1 };
    if (req.query.sort === "price_asc") sortOption = { price: 1 };
    else if (req.query.sort === "price_desc") sortOption = { price: -1 };
    else if (req.query.sort === "top_rated") sortOption = { rating: -1 };

    // 4. TRUY VẤN SẢN PHẨM (Phân trang)
    const count = await Product.countDocuments(finalQuery);
    const products = await Product.find(finalQuery)
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // 5. TRẢ VỀ KẾT QUẢ KÈM BỘ LỌC ĐỘNG
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProduct: count,
      // 👇 Gửi kèm bộ lọc thông minh về cho Frontend
      filterOptions: {
        categories: ["All", ...availableCategories],
        brands: ["All", ...availableBrands],
        maxPrice: maxPriceAvailable
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... CÁC HÀM KHÁC GIỮ NGUYÊN (Copy lại từ file cũ của bạn) ...
const getProductById = async (req, res) => { try { const product = await Product.findById(req.params.id); if (product) { res.json(product); } else { res.status(404).json({ message: "Không tìm thấy sản phẩm" }); } } catch (error) { res.status(500).json({ message: error.message }); } };
const createProduct = async (req, res) => { try { const { name, price, description, image, brand, category, countInStock, hasVariants, variants, images } = req.body; if (!req.user) { return res.status(401).json({ message: "Lỗi xác thực" }); } const product = new Product({ name, price: price || 0, user: req.user._id, image, brand, category, countInStock: countInStock || 0, images: images || [], numReviews: 0, description, hasVariants: hasVariants || false, variants: variants || [], }); const createdProduct = await product.save(); res.status(201).json(createdProduct); } catch (error) { res.status(500).json({ message: "Lỗi tạo sản phẩm: " + error.message }); } };
const updateProduct = async (req, res) => { try { const { name, price, description, image, brand, category, countInStock, images, hasVariants, variants, } = req.body; const product = await Product.findById(req.params.id); if (product) { product.name = name || product.name; product.price = price || 0; product.description = description || product.description; product.image = image || product.image; product.brand = brand || product.brand; product.category = category || product.category; product.countInStock = countInStock || 0; product.images = images || product.images; product.hasVariants = hasVariants; product.variants = variants; const updatedProduct = await product.save(); res.json(updatedProduct); } else { res.status(404).json({ message: "Sản phẩm không tồn tại" }); } } catch (error) { res.status(500).json({ message: "Lỗi cập nhật: " + error.message }); } };
const deleteProduct = async (req, res) => { try { const product = await Product.findById(req.params.id); if (product) { await product.deleteOne(); res.json({ message: "Đã xóa sản phẩm" }); } else { res.status(404).json({ message: "Sản phẩm không tồn tại" }); } } catch (error) { res.status(500).json({ message: error.message }); } };
const getTopProducts = async (req, res) => { try { const products = await Product.find({}).sort({ rating: -1 }).limit(3); res.json(products); } catch (error) { res.status(500).json({ message: error.message }); } };
const createProductReview = async (req, res) => { const { rating, comment, userId, name } = req.body; const product = await Product.findById(req.params.id); if (product) { const alreadyReviewed = product.reviews.find((r) => r.user.toString() === userId.toString()); if (alreadyReviewed) { return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi" }); } const review = { name: name, rating: Number(rating), comment, user: userId, replies: [] }; product.reviews.push(review); product.numReviews = product.reviews.length; product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length; await product.save(); res.status(201).json({ message: "Đã thêm đánh giá" }); } else { res.status(404).json({ message: "Sản phẩm không tồn tại" }); } };
const getAllReviews = async (req, res) => { try { const products = await Product.find({}).select('name reviews'); let allReviews = []; products.forEach(product => { product.reviews.forEach(review => { allReviews.push({ ...review._doc, productName: product.name, productId: product._id }); }); }); res.json(allReviews); } catch (error) { res.status(500).json({ message: error.message }); } };
const replyReview = async (req, res) => { const { productId, reviewId } = req.params; const { comment, name, userId, isAdmin } = req.body; const product = await Product.findById(productId); if (product) { const review = product.reviews.id(reviewId); if (review) { const newReply = { name: name, comment: comment, user: userId, isAdmin: isAdmin || false, }; review.replies.push(newReply); await product.save(); res.json({ message: "Đã trả lời bình luận" }); } else { res.status(404).json({ message: "Review không tồn tại" }); } } else { res.status(404).json({ message: "Sản phẩm không tồn tại" }); } };
const toggleSpamReview = async (req, res) => { const { productId, reviewId } = req.params; const product = await Product.findById(productId); if (product) { const review = product.reviews.id(reviewId); if (review) { review.isSpam = !review.isSpam; await product.save(); res.json({ message: "Đã thay đổi trạng thái spam" }); } else { res.status(404).json({ message: "Review không tìm thấy" }); } } else { res.status(404).json({ message: "Sản phẩm không tồn tại" }); } };
const deleteReview = async (req, res) => { const { productId, reviewId } = req.params; const product = await Product.findById(productId); if (product) { product.reviews = product.reviews.filter((r) => r._id.toString() !== reviewId.toString()); product.numReviews = product.reviews.length; if (product.numReviews > 0) { product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length; } else { product.rating = 0; } await product.save(); res.json({ message: "Đã xóa review" }); } else { res.status(404).json({ message: "Sản phẩm không tồn tại" }); } };
const getFilterData = async (req, res) => { try { const categories = await Product.distinct("category"); const brands = await Product.distinct("brand"); const maxPriceProduct = await Product.findOne().sort({ price: -1 }); const maxPrice = maxPriceProduct ? maxPriceProduct.price : 0; res.json({ categories, brands, maxPrice }); } catch (error) { res.status(500).json({ message: error.message }); } };

module.exports = {
  getProducts,
  getFilterData,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  replyReview,
  getAllReviews,
  toggleSpamReview,
  deleteReview,
  getTopProducts
};
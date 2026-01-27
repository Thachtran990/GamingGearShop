const Product = require("../models/productModel.js");

// @desc    Lấy tất cả sản phẩm (Có tìm kiếm & Phân trang)
// @route   GET /api/products
// const getProducts = async (req, res) => {
//   try {
//     const keyword = req.query.keyword
//       ? { name: { $regex: req.query.keyword, $options: "i" } }
//       : {};

//     const products = await Product.find({ ...keyword });
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getProducts = async (req, res) => {
  try {
    const pageSize = 8; // 👇 Số lượng sản phẩm trên 1 trang (Bạn có thể sửa số này)
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};

    // Đếm tổng số sản phẩm khớp với từ khóa
    const count = await Product.countDocuments({ ...keyword });
    
    // Lấy sản phẩm theo trang
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // 👇 TRẢ VỀ CẤU TRÚC CHUẨN CHO FRONTEND
    res.json({ 
        products, 
        page, 
        pages: Math.ceil(count / pageSize) 
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy chi tiết 1 sản phẩm
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      image,
      brand,
      category,
      countInStock,
      hasVariants,
      variants,
    } = req.body;

    const product = new Product({
      name,
      price: price || 0,
      user: req.user._id,
      image,
      brand,
      category,
      countInStock: countInStock || 0,
      numReviews: 0,
      description,
      hasVariants: hasVariants || false,
      variants: variants || [],
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo sản phẩm: " + error.message });
  }
};

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      image,
      brand,
      category,
      countInStock,
      hasVariants,
      variants,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || 0;
      product.description = description || product.description;
      product.image = image || product.image;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.countInStock = countInStock || 0;
      product.hasVariants = hasVariants; 
      product.variants = variants;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật: " + error.message });
  }
};

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Đã xóa sản phẩm" });
    } else {
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- CÁC HÀM VỀ REVIEW (ĐÃ PHỤC HỒI ĐẦY ĐỦ) ---

// @desc    Tạo review mới
const createProductReview = async (req, res) => {
  const { rating, comment, userId, name } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
    }

    const review = {
      name: name,
      rating: Number(rating),
      comment,
      user: userId,
      replies: []
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Đã thêm đánh giá" });
  } else {
    res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }
};

// @desc    Lấy tất cả review (Admin)
const getAllReviews = async (req, res) => {
    try {
        const products = await Product.find({}).select('name reviews');
        let allReviews = [];
        products.forEach(product => {
            product.reviews.forEach(review => {
                allReviews.push({
                    ...review._doc,
                    productName: product.name,
                    productId: product._id
                });
            });
        });
        res.json(allReviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Trả lời review
const replyReview = async (req, res) => {
  const { productId, reviewId } = req.params;
  const { comment, name, userId, isAdmin } = req.body;

  const product = await Product.findById(productId);
  if (product) {
    const review = product.reviews.id(reviewId);
    if (review) {
      const newReply = {
        name: name,
        comment: comment,
        user: userId,
        isAdmin: isAdmin || false,
      };
      review.replies.push(newReply);
      await product.save();
      res.json({ message: "Đã trả lời bình luận" });
    } else {
      res.status(404).json({ message: "Review không tồn tại" });
    }
  } else {
    res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }
};

// @desc    Ẩn/Hiện review (Spam)
const toggleSpamReview = async (req, res) => {
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);
    if(product) {
        const review = product.reviews.id(reviewId);
        if(review) {
            review.isSpam = !review.isSpam;
            await product.save();
            res.json({ message: "Đã thay đổi trạng thái spam" });
        } else {
            res.status(404).json({ message: "Review không tìm thấy" });
        }
    } else {
        res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
};

// @desc    Xóa review
const deleteReview = async (req, res) => {
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);
    if (product) {
        // Lọc bỏ review cần xóa
        product.reviews = product.reviews.filter(
            (r) => r._id.toString() !== reviewId.toString()
        );
        
        // Tính lại rating
        product.numReviews = product.reviews.length;
        if(product.numReviews > 0) {
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        } else {
            product.rating = 0;
        }

        await product.save();
        res.json({ message: "Đã xóa review" });
    } else {
        res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
};

// 👇 QUAN TRỌNG: Xuất khẩu đầy đủ tất cả các hàm
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  replyReview,
  getAllReviews,
  toggleSpamReview, // <-- Đã thêm lại
  deleteReview      // <-- Đã thêm lại
};
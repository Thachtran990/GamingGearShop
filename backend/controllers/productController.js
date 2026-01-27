const Product = require('../models/productModel');

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/products
// @access  Public
// @desc    Lấy tất cả sản phẩm (Có Phân trang + Tìm kiếm)
// @route   GET /api/products?keyword=...&pageNumber=...
// @access  Public
const getProducts = async (req, res) => {
  // 1. Quy định số lượng sản phẩm trên 1 trang (để 4 hoặc 8 cho dễ test)
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1; // Trang hiện tại (mặc định là 1)

  const keyword = req.query.keyword
    ? {
      name: {
        $regex: req.query.keyword,
        $options: "i",
      },
    }
    : {};

  // 2. Đếm tổng số sản phẩm khớp với từ khóa (để biết cần chia bao nhiêu trang)
  const count = await Product.countDocuments({ ...keyword });

  // 3. Logic lấy dữ liệu:
  // .limit(pageSize): Chỉ lấy đúng số lượng quy định
  // .skip(): Bỏ qua các sản phẩm của trang trước
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  // 4. Trả về: danh sách sản phẩm, trang hiện tại, tổng số trang
  res.json({ products, page, pages: Math.ceil(count / pageSize) });
};

// @desc    Lấy 1 sản phẩm theo ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // Tìm theo ID trên link

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id }); // Lệnh xóa
      res.json({ message: "Đã xóa sản phẩm thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

const createProduct = async (req, res) => {
  const { name, price, description, image, category, brand } = req.body;

  try {
    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      brand, // 2. Thêm brand vào dòng này nữa
      countInStock: 0, // Mặc định kho = 0
      rating: 0,
      numReviews: 0,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.log("LOG LỖI CHI TIẾT:", error);
    res.status(400).json({ message: "Lỗi tạo sản phẩm" });
  }
};


const updateProduct = async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
};

const createProductReview = async (req, res) => {
  const { rating, comment, userId, name } = req.body; // Lấy thông tin từ Frontend gửi lên

  const product = await Product.findById(req.params.id);

  if (product) {
    // 1. Kiểm tra xem ông này đã bình luận chưa (Mỗi người chỉ được 1 lần)
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi!" });
    }

    // 2. Tạo bình luận mới
    const review = {
      name: name,
      rating: Number(rating),
      comment,
      user: userId,
    };

    product.reviews.push(review); // Đẩy vào mảng

    // 3. Cập nhật số lượng và điểm trung bình
    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Đã thêm đánh giá" });
  } else {
    res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
};


// @desc    Lấy TẤT CẢ nhận xét trong hệ thống (Admin)
// @route   GET /api/products/admin/reviews
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  // Tìm tất cả sản phẩm có reviews
  const products = await Product.find({ reviews: { $exists: true, $ne: [] } })
    .select('reviews name image');

  let allReviews = [];

  // Gom tất cả reviews lại thành 1 mảng phẳng để dễ hiển thị
  products.forEach(product => {
    product.reviews.forEach(review => {
      allReviews.push({
        _id: review._id,
        productId: product._id,
        productName: product.name,
        productImage: product.image,
        userName: review.name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        adminReply: review.adminReply,
        isSpam: review.isSpam
      });
    });
  });

  // Sắp xếp mới nhất lên đầu
  allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(allReviews);
};

// @desc    Admin trả lời nhận xét
// @route   PUT /api/products/reviews/:productId/:reviewId/reply
const replyReview = async (req, res) => {
  const { productId, reviewId } = req.params;
  const { comment, name, userId, isAdmin } = req.body; // Nhận thêm info người trả lời

  const product = await Product.findById(productId);
  if (product) {
    const review = product.reviews.id(reviewId);
    if (review) {

      // Tạo đối tượng câu trả lời mới
      const newReply = {
        name: name,
        comment: comment,
        user: userId,
        isAdmin: isAdmin || false,
      };

      // Đẩy vào mảng
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

// @desc    Đánh dấu Spam (Ẩn/Hiện)
// @route   PUT /api/products/reviews/:productId/:reviewId/spam
const toggleSpamReview = async (req, res) => {
  const { productId, reviewId } = req.params;
  const product = await Product.findById(productId);

  if (product) {
    const review = product.reviews.id(reviewId);
    if (review) {
      review.isSpam = !review.isSpam; // Đảo ngược trạng thái
      await product.save();
      res.json({ message: "Đã cập nhật trạng thái Spam" });
    } else {
      res.status(404).json({ message: "Review không tồn tại" });
    }
  } else {
    res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }
};

// @desc    Xóa vĩnh viễn nhận xét
// @route   DELETE /api/products/reviews/:productId/:reviewId
const deleteReview = async (req, res) => {
  const { productId, reviewId } = req.params;
  const product = await Product.findById(productId);

  if (product) {
    // Lọc bỏ review cần xóa ra khỏi mảng
    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== reviewId.toString()
    );

    // Tính lại điểm trung bình sau khi xóa
    product.numReviews = product.reviews.length;
    if (product.numReviews > 0) {
      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    } else {
      product.rating = 0;
    }

    await product.save();
    res.json({ message: "Đã xóa bình luận" });
  } else {
    res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getAllReviews,
  replyReview,
  toggleSpamReview,
  deleteReview
};
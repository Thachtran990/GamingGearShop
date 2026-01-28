const express = require("express");
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware.js');
// 1. Import thêm updateProduct
const { 
  getProducts, 
  getProductById, 
  deleteProduct, 
  createProduct, 
  updateProduct ,
  createProductReview,
  getAllReviews, 
  replyReview, 
  toggleSpamReview, 
  deleteReview,
  getFilterData
} = require("../controllers/productController.js");

// Route lấy tất cả review (Đặt lên trên cùng các route có param :id để tránh xung đột)
router.get('/admin/reviews', protect, admin, getAllReviews);

// 👇 Thêm route này (đặt TRƯỚC route /:id)
router.route('/config/filters').get(getFilterData);

router.route("/").get(getProducts).post(protect, admin, createProduct);
// 2. Thêm Route cho Review
router.route("/:id/reviews").post(createProductReview);

// Các route thao tác cụ thể
//router.put('/reviews/:productId/:reviewId/reply', protect, admin, replyReview);
// Đổi method từ PUT sang POST cho đúng ngữ nghĩa tạo mới
// Bỏ middleware 'admin' đi, chỉ cần 'protect' (đăng nhập) là được trả lời
router.post('/reviews/:productId/:reviewId/reply', protect, replyReview);
router.put('/reviews/:productId/:reviewId/spam', protect, admin, toggleSpamReview);
router.delete('/reviews/:productId/:reviewId', protect, admin, deleteReview);

// 2. Sửa dòng này: Gộp GET (lấy chi tiết), DELETE (xóa) và PUT (sửa) vào chung 1 dòng cho gọn
router.route("/:id")
  .get(getProductById)
  .delete(deleteProduct)
  .put(updateProduct); // <--- Thêm phương thức PUT

module.exports = router;
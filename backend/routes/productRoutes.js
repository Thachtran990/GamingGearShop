const express = require("express");
const router = express.Router();
// 1. Import thêm updateProduct
const { 
  getProducts, 
  getProductById, 
  deleteProduct, 
  createProduct, 
  updateProduct 
} = require("../controllers/productController.js");

router.route("/").get(getProducts).post(createProduct);

// 2. Sửa dòng này: Gộp GET (lấy chi tiết), DELETE (xóa) và PUT (sửa) vào chung 1 dòng cho gọn
router.route("/:id")
  .get(getProductById)
  .delete(deleteProduct)
  .put(updateProduct); // <--- Thêm phương thức PUT

module.exports = router;
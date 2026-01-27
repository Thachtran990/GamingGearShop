const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware.js");

// 👇 IMPORT TẤT CẢ CÁC HÀM TỪ CONTROLLER VÀO ĐÂY
const {
  addOrderItems,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus, // <--- Quan trọng: Phải import vào mới dùng được
  softDeleteOrder    // <--- Quan trọng: Phải import vào mới dùng được
} = require("../controllers/orderController.js");

// 1. Route tạo đơn & Lấy tất cả đơn (Admin)
router.route("/")
  .post(addOrderItems)
  .get(authMiddleware.protect, authMiddleware.admin, getOrders);

// 2. Route xem lịch sử đơn của user
router.get("/myorders", authMiddleware.protect, getMyOrders);

// 3. Route xử lý từng đơn hàng cụ thể (theo ID)
router.route("/:id")
  .get(getOrderById); // Mở cửa cho cả khách vãng lai xem

// 4. Route thanh toán
router.route("/:id/pay").put(updateOrderToPaid);

// 5. Route giao hàng (Admin)
router.route("/:id/deliver")
  .put(authMiddleware.protect, authMiddleware.admin, updateOrderToDelivered);

// 👇 6. HAI ROUTE MỚI BẠN VỪA THÊM (Cập nhật trạng thái & Xóa mềm)
router.route("/:id/status")
  .put(authMiddleware.protect, authMiddleware.admin, updateOrderStatus);

router.route("/:id/delete")
  .put(authMiddleware.protect, authMiddleware.admin, softDeleteOrder);

module.exports = router;
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
  updateOrderToCancelled,
  updateOrderStatus, 
  deleteOrderForAdmin, // <--- ĐÃ ĐỔI: Dùng hàm mới này thay cho softDeleteOrder
  restoreOrderForAdmin
} = require("../controllers/orderController.js");

// 👇 QUAN TRỌNG: Phải import 2 ông bảo vệ này vào thì mới dùng được
const { protect, admin } = require("../middlewares/authMiddleware.js");

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

// 5. Route giao hàng (Admin - Logic cũ, giữ lại để tương thích nếu cần)
router.route("/:id/deliver")
  .put(authMiddleware.protect, authMiddleware.admin, updateOrderToDelivered);

// 6. Route Cập nhật trạng thái (Dùng cho Dropdown menu)
router.route("/:id/status")
  .put(authMiddleware.protect, authMiddleware.admin, updateOrderStatus);

// 👇 7. ROUTE MỚI: Xóa đơn khỏi trang Admin (Khách vẫn thấy)
// Lưu ý: Đã đổi tên endpoint thành 'admin-delete' cho khớp với Frontend
router.route("/:id/admin-delete")
  .put(authMiddleware.protect, authMiddleware.admin, deleteOrderForAdmin);

  // 2. Thêm route khôi phục xuống dưới cùng
router.route("/:id/admin-restore")
  .put(authMiddleware.protect, authMiddleware.admin, restoreOrderForAdmin);

  // 👇 THÊM ROUTE NÀY CHO NÚT HỦY ĐƠN
router.route("/:id/cancel").put(protect, admin, updateOrderToCancelled);

module.exports = router;
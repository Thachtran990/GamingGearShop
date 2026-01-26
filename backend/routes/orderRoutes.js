const express = require("express");
const router = express.Router();
// 👇 1. QUAN TRỌNG: Phải có chữ 'getOrders' màu vàng ở đây
const { addOrderItems, getMyOrders, getOrders } = require("../controllers/orderController.js");

// 👇 2. QUAN TRỌNG: Phải dùng .route("/").post(...).get(...)
// (Nếu bạn đang để router.post("/") riêng lẻ là sai nhé)
router.route("/").post(addOrderItems).get(getOrders);

router.get("/myorders", getMyOrders);

module.exports = router;
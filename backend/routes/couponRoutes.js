const express = require("express"); // require
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  deleteCoupon,
  applyCoupon,
} = require("../controllers/couponController.js"); // require
const { protect, admin } = require("../middlewares/authMiddleware.js"); // require

router.route("/")
    .post(protect, admin, createCoupon)
    .get(protect, admin, getCoupons);

router.route("/:id")
    .delete(protect, admin, deleteCoupon);

router.post("/apply", protect, applyCoupon);

// Đổi export default -> module.exports
module.exports = router;
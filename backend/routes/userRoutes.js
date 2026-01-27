const express = require("express");
const router = express.Router();
const { authUser, registerUser, updateUserProfile } = require("../controllers/userController.js");
const { protect } = require("../middlewares/authMiddleware.js"); // <--- Đảm bảo đã import

router.post("/login", authUser);
router.post("/", registerUser);

// 👇 QUAN TRỌNG: Phải có chữ 'protect' ở giữa
router.route("/profile").put(protect, updateUserProfile); 

module.exports = router;
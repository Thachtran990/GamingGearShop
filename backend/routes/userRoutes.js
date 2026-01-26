const express = require("express");
const { registerUser, authUser } = require("../controllers/userController.js"); // 1. Thêm authUser

const router = express.Router();

router.post("/", registerUser);
router.post("/login", authUser); // 2. Thêm dòng này

module.exports = router;
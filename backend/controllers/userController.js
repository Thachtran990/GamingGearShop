const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

// Hàm tạo Token (Chìa khóa)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "bi_mat_khong_bat_mi", {
    expiresIn: "30d", // Token sống trong 30 ngày
  });
};

// @desc    Đăng nhập & Lấy Token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id), // 👈 QUAN TRỌNG: Phải trả về dòng này
    });
  } else {
    res.status(401).json({ message: "Sai email hoặc mật khẩu" });
  }
};

// @desc    Đăng ký tài khoản mới
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "Email này đã được sử dụng" });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id), // 👈 Đăng ký xong cũng phải phát token luôn
    });
  } else {
    res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }
};

// @desc    Cập nhật thông tin User
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    // Tìm user theo ID lấy từ Token
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      // Nếu có nhập mật khẩu mới thì mới cập nhật
      if (req.body.password) {
        user.password = req.body.password;
      }

      // Lưu lại (Lúc này nó sẽ chạy qua pre('save') ở Model)
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy User" });
    }
  } catch (error) {
    console.error("Lỗi update profile:", error); // In lỗi ra terminal để dễ sửa
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

module.exports = { authUser, registerUser, updateUserProfile };
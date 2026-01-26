const User = require("../models/userModel.js");
const bcrypt = require("bcryptjs");

// Đăng ký (Giữ nguyên)
const registerUser = async (req, res) => {
  // ... (Code cũ giữ nguyên, không cần sửa gì ở đây) ...
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) throw new Error("Vui lòng điền đầy đủ thông tin");
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email này đã được sử dụng" });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- THÊM ĐOẠN NÀY: Đăng nhập ---
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Kiểm tra: Có user đó không? VÀ Mật khẩu có khớp không?
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- SỬA DÒNG CUỐI CÙNG ---
module.exports = { registerUser, authUser };
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

// Hàm kiểm tra mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 👇 ĐÂY LÀ ĐOẠN QUAN TRỌNG ĐÃ SỬA:
// 1. Bỏ chữ 'next' trong ngoặc đơn: async function ()
userSchema.pre("save", async function () {
  
  // 2. Nếu mật khẩu không đổi -> return (Thoát luôn, không gọi next)
  if (!this.isModified("password")) {
    return; 
  }

  // 3. Nếu có đổi -> Mã hóa
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // 4. Tuyệt đối không viết next() ở cuối
});

const User = mongoose.model("User", userSchema);

module.exports = User;
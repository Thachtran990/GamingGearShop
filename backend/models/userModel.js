const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User; // <-- Quan trọng: Dùng module.exports
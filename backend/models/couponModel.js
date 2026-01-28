const mongoose = require("mongoose"); // Đổi import -> require

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String },
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
      default: "fixed",
    },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: 0 },
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usedCount: { type: Number, default: 0 },
    countInStock: { type: Number, default: 100 },
    usersUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Thêm cái này để track user
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

// Đổi export default -> module.exports
module.exports = Coupon;
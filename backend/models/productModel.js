const mongoose = require("mongoose");

// 1. Quy định cấu trúc của 1 lời bình luận
// 1. Schema cho các câu trả lời nhỏ bên trong (Sub-comment)
const replySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    isAdmin: { type: Boolean, default: false }, // Để tô màu phân biệt Admin
  },
  { timestamps: true }
);

// 2. Schema review chính
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    isSpam: { type: Boolean, default: false },
    
    // 👇 THAY ĐỔI Ở ĐÂY: Thay adminReply bằng mảng replies
    replies: [replySchema], 
  },
  { timestamps: true }
);

// 2. Cấu trúc sản phẩm chính
const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    
    // 👇 THÊM MỚI: Mảng chứa các bình luận
    reviews: [reviewSchema], 
    
    // 👇 Điểm đánh giá trung bình
    rating: { type: Number, required: true, default: 0 }, 
    
    // 👇 Tổng số lượng đánh giá
    numReviews: { type: Number, required: true, default: 0 }, 
    
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
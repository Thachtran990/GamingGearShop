const mongoose = require("mongoose");

// --- PHẦN 1: CẤU TRÚC REVIEW & COMMENT (GIỮ NGUYÊN CỦA BẠN) ---

// 1.1 Schema cho các câu trả lời nhỏ bên trong (Sub-comment)
const replySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    isAdmin: { type: Boolean, default: false }, // Để tô màu phân biệt Admin
  },
  { timestamps: true }
);

// 1.2 Schema review chính
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
    replies: [replySchema], 
  },
  { timestamps: true }
);

// --- PHẦN 2: CẤU TRÚC BIẾN THỂ (MỚI THÊM VÀO) ---

// 👇 2.1 Schema cho từng biến thể con (Ví dụ: Chuột đen, Chuột trắng)
const variantSchema = mongoose.Schema({
  sku: { type: String }, // Mã kho riêng (VD: G102-BLK)
  price: { type: Number, required: true }, // Giá riêng của biến thể
  countInStock: { type: Number, required: true, default: 0 }, // Kho riêng
  image: { type: String }, // Ảnh riêng (nếu cần)
  
  // Mảng chứa các thuộc tính động. VD: [{ k: "Màu", v: "Đen" }, { k: "Switch", v: "Red" }]
  attributes: [
    {
      k: { type: String, required: true }, // Key (Tên thuộc tính)
      v: { type: String, required: true }  // Value (Giá trị)
    }
  ]
});

// --- PHẦN 3: CẤU TRÚC SẢN PHẨM CHÍNH ---

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Để false cho dễ test, sau này nên để true
      ref: "User",
    },
    name: { type: String, required: true },
    image: { type: String, required: true }, // Ảnh đại diện chung
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    
    // Mảng review cũ
    reviews: [reviewSchema], 
    
    rating: { type: Number, required: true, default: 0 }, 
    numReviews: { type: Number, required: true, default: 0 }, 
    
    // 👇 HAI TRƯỜNG NÀY VẪN GIỮ LẠI (Dùng cho sản phẩm đơn giản hoặc làm giá hiển thị mặc định)
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },

    // 👇 THÊM MỚI: Cờ đánh dấu sản phẩm có biến thể hay không
    hasVariants: { type: Boolean, default: false },

    // 👇 THÊM MỚI: Mảng chứa danh sách biến thể
    variants: [variantSchema], 
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
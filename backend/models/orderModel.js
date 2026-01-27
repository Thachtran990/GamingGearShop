const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },

    status: { 
      type: String, 
      required: true, 
      default: "Chờ xử lý", // Mặc định đơn mới vào sẽ là cái này
      enum: ["Chờ xử lý", "Đang giao hàng", "Đã giao hàng", "Đã hủy"] 
    },
    isDeleted: { 
      type: Boolean, 
      required: true, 
      default: false // Mặc định là chưa xóa
    },

    // 👇 BẠN ĐÃ CÓ ĐOẠN NÀY CHƯA? (Nếu thiếu đoạn này là mất sạch tên khách)
    guestInfo: {
      name: { type: String },
      email: { type: String },
    },

    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    
    // 👇 1. ĐÂY LÀ PHẦN BẠN ĐANG THIẾU (Đã thêm phone) 👇
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true }, // <--- Số điện thoại nằm ở đây
    },

    // 👇 2. Các trường bổ sung để tính toán tiền nong chuẩn chỉ
    paymentMethod: {
      type: String,
      required: true,
      default: "COD", // Thanh toán khi nhận hàng
    },
    paymentResult: { // Dành cho PayPal sau này (tạm thời để id, status)
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: { // Tiền hàng (chưa ship)
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: { // Phí ship
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: { // Tổng cộng
      type: Number,
      required: true,
      default: 0.0,
    },
    
    // Trạng thái đơn
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date }, // Ngày thanh toán
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date }, // Ngày giao hàng
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
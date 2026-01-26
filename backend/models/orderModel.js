const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: "User" // Liên kết với bảng User để biết ai mua
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
          ref: "Product", // Liên kết để biết mua sản phẩm nào
        },
      },
    ],
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false }, // Đã thanh toán chưa (mặc định là chưa - COD)
    isDelivered: { type: Boolean, required: true, default: false }, // Đã giao hàng chưa
  },
  { timestamps: true } // Lưu thời gian tạo đơn
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
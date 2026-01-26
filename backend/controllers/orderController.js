const Order = require("../models/orderModel.js");

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private (Chỉ user đã đăng nhập)
const addOrderItems = async (req, res) => {
  const { orderItems, totalPrice, userId } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: "Không có sản phẩm nào trong giỏ" });
  } else {
    const order = new Order({
      user: userId, // ID của người mua
      orderItems,
      totalPrice,
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  }
};

const getMyOrders = async (req, res) => {
  try {
    // Tìm trong bảng Order, lấy tất cả đơn có field 'user' trùng với ID người gửi
    // req.query.userId là do mình sẽ gửi từ frontend lên
    const orders = await Order.find({ user: req.query.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng" });
  }
};

const getOrders = async (req, res) => {
  try {
    // Lấy tất cả đơn, sắp xếp đơn mới nhất lên đầu
    // .populate giúp lấy luôn tên user từ bảng User
    const orders = await Order.find({}).populate("user", "id username").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn" });
  }
};

module.exports = { addOrderItems, getMyOrders, getOrders };
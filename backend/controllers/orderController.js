const Order = require("../models/orderModel.js");
const jwt = require("jsonwebtoken");

// @desc    Tạo đơn hàng mới (Hỗ trợ cả Guest và Member)
// @route   POST /api/orders
// @access  Public (Mở cho cả khách vãng lai)
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      guestName,
      guestEmail,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm trong giỏ hàng" });
    }

    // --- LOGIC PHÂN BIỆT GUEST / MEMBER ---
    let userId = null;
    let finalGuestInfo = null;

    // 1. Kiểm tra Token (Nếu có thì lấy ID User)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "bi_mat_khong_bat_mi");
        userId = decoded.id;
      } catch (error) {
        console.log("Token lỗi hoặc không có, coi như là Guest");
      }
    }

    // 2. Nếu không phải Member -> Lưu thông tin Guest
    if (!userId) {
       finalGuestInfo = {
          name: guestName || "Khách vãng lai",
          email: guestEmail || "guest@example.com"
       };
    }

    const order = new Order({
      user: userId,          
      guestInfo: finalGuestInfo, 
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error("Lỗi tạo đơn:", error);
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

// @desc    Lấy chi tiết 1 đơn hàng
// @route   GET /api/orders/:id
// @access  Private/Public (Tùy cấu hình route)
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
};

// @desc    Cập nhật trạng thái đã thanh toán
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
};

// @desc    Cập nhật trạng thái Đã giao hàng (Admin)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
};

// @desc    Lấy danh sách đơn hàng của User đang đăng nhập
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  // Chỉ tìm đơn hàng của user này
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.json(orders);
};

// @desc    Cập nhật trạng thái đơn hàng (Admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    
    // --- ĐOẠN LOGIC ĐỒNG BỘ MỚI ---
    if (order.status === "Đã giao hàng") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else {
      // Nếu trạng thái LÀ "Chờ xử lý" HOẶC "Đang giao hàng" -> Phải set ngược lại là chưa giao
      order.isDelivered = false;
      order.deliveredAt = null; // Xóa ngày giao luôn
    }
    // -------------------------------

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
};

// @desc    Xóa mềm / Khôi phục đơn hàng (Admin)
// @route   PUT /api/orders/:id/delete
const softDeleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Đảo ngược trạng thái: Nếu đang xóa thì thành chưa xóa, và ngược lại
    order.isDeleted = !order.isDeleted; 
    
    const updatedOrder = await order.save();
    res.json({ message: "Đã cập nhật trạng thái xóa", isDeleted: updatedOrder.isDeleted });
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
};

// 👇 XUẤT KHẨU TẤT CẢ HÀM (Quan trọng)
module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders, // <--- Hàm bị thiếu lúc nãy đây
  getOrders,
  updateOrderStatus,
  softDeleteOrder,
};
const Order = require("../models/orderModel.js");
const jwt = require("jsonwebtoken");

// @desc    Tạo đơn hàng mới (Hỗ trợ cả Guest và Member)
// @route   POST /api/orders
// @access  Public
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
// @access  Private/Public
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

// @desc    Cập nhật trạng thái Đã giao hàng (Admin - Legacy)
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
  // 👇 CẬP NHẬT: Lấy tất cả, sắp xếp mới nhất lên đầu
  const orders = await Order.find({ user: req.user._id })
                            .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/orders
// @access  Private/Admin

// 1. SỬA LẠI HÀM getOrders (Hỗ trợ lọc đơn đã xóa)
const getOrders = async (req, res) => {
  // 1. Kiểm tra xem Frontend đang đòi xem cái gì
  // Nếu url là /api/orders?deleted=true -> viewDeleted = true
  const viewDeleted = req.query.deleted === 'true';

  let query = {};

  if (viewDeleted) {
    // TRƯỜNG HỢP 1: Xem thùng rác
    // Chỉ lấy những đơn đã bị đánh dấu xóa (true)
    query = { isDeletedByAdmin: true };
  } else {
    // TRƯỜNG HỢP 2: Xem danh sách chính
    // Lấy đơn có isDeletedByAdmin là false HOẶC không có trường này (đơn cũ)
    query = { 
        $or: [
            { isDeletedByAdmin: false },
            { isDeletedByAdmin: { $exists: false } }
        ]
    };
    // Mẹo: Bạn có thể viết ngắn gọn là: { isDeletedByAdmin: { $ne: true } }
  }

  const orders = await Order.find(query)
                            .populate("user", "id name")
                            .sort({ createdAt: -1 }); // Mới nhất lên đầu
  res.json(orders);
};

// @desc    Cập nhật trạng thái đơn hàng (Admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    
    // --- LOGIC ĐỒNG BỘ TRẠNG THÁI ---
    if (order.status === "Đã giao hàng") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else {
      order.isDelivered = false;
      order.deliveredAt = null; 
    }
    // -------------------------------

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
};

// @desc    Xóa vĩnh viễn đơn hàng khỏi trang Admin (Thực chất là ẩn đi)
// @route   PUT /api/orders/:id/admin-delete
// @access  Private/Admin
const deleteOrderForAdmin = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Chỉ bật cờ này lên, dữ liệu vẫn còn trong DB nhưng Admin không thấy nữa
    order.isDeletedByAdmin = true; 
    
    const updatedOrder = await order.save();
    res.json({ message: "Đã xóa đơn hàng khỏi trang quản trị", isDeletedByAdmin: true });
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
};

// 2. THÊM HÀM MỚI: Khôi phục đơn hàng (Lấy lại từ thùng rác)
// @route PUT /api/orders/:id/admin-restore
const restoreOrderForAdmin = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDeletedByAdmin = false; // Tắt cờ xóa đi -> Hiện lại
    await order.save();
    res.json({ message: "Đã khôi phục đơn hàng" });
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
}

// 👇 XUẤT KHẨU TẤT CẢ HÀM
module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders, 
  getOrders,
  updateOrderStatus,
  deleteOrderForAdmin,
  restoreOrderForAdmin, // <--- Đã thay thế hàm softDeleteOrder bằng hàm này
};
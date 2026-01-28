const Order = require("../models/orderModel.js");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel.js"); // Nhớ import Product

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

    // --- LOGIC GUEST / MEMBER ---
    let userId = null;
    let finalGuestInfo = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "bi_mat_khong_bat_mi");
        userId = decoded.id;
      } catch (error) {
        console.log("Token lỗi hoặc không có, coi như là Guest");
      }
    }

    if (!userId) {
      finalGuestInfo = {
        name: guestName || "Khách vãng lai",
        email: guestEmail || "guest@example.com"
      };
    }

    // 1. TẠO ĐƠN HÀNG
    // 👇 SỬA LẠI ĐOẠN NÀY: Map lại orderItems để chắc chắn variantId được lưu
    const orderItemsMapped = orderItems.map((item) => ({
        ...item,
        product: item.product,
        // Ép buộc lấy variantId từ request, nếu không có thì là null
        variantId: item.variantId || null, 
        _id: undefined // Bỏ _id do frontend gửi để Mongo tự tạo _id mới cho subdocument
    }));

    const order = new Order({
      user: userId,
      guestInfo: finalGuestInfo,
      orderItems: orderItemsMapped, // <-- Dùng mảng đã map
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // 2. TRỪ TỒN KHO (INVENTORY UPDATE)
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (product) {
        // TRƯỜNG HỢP A: SẢN PHẨM CÓ BIẾN THỂ
        if (item.variantId) {
          // Logic tìm biến thể an toàn hơn
          const variant = product.variants && product.variants.find(
              v => v._id.toString() === item.variantId.toString()
          );
          
          if (variant) {
            variant.countInStock = variant.countInStock - item.qty;
            if (variant.countInStock < 0) variant.countInStock = 0;
            // 👇 QUAN TRỌNG: Đánh dấu đã sửa variants để lưu
            product.markModified('variants'); 
          }
        }
        // TRƯỜNG HỢP B: SẢN PHẨM THƯỜNG
        else {
          product.countInStock = product.countInStock - item.qty;
          if (product.countInStock < 0) product.countInStock = 0;
        }

        await product.save();
      }
    }

    res.status(201).json(createdOrder);

  } catch (error) {
    console.error("Lỗi tạo đơn:", error);
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

// @desc    Lấy chi tiết 1 đơn hàng
// @route   GET /api/orders/:id
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

// @desc    Cập nhật trạng thái Đã giao hàng
// @route   PUT /api/orders/:id/deliver
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

// @desc    Lấy danh sách đơn hàng của User
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/orders
const getOrders = async (req, res) => {
  const viewDeleted = req.query.deleted === 'true';
  let query = {};

  if (viewDeleted) {
    query = { isDeletedByAdmin: true };
  } else {
    query = {
      $or: [
        { isDeletedByAdmin: false },
        { isDeletedByAdmin: { $exists: false } }
      ]
    };
  }

  const orders = await Order.find(query)
    .populate("user", "id name")
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Cập nhật trạng thái đơn hàng (Admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.status = req.body.status || order.status;
    if (order.status === "Đã giao hàng") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else {
      order.isDelivered = false;
      order.deliveredAt = null;
    }
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
};

// @desc    Xóa vĩnh viễn đơn hàng khỏi trang Admin
// @route   PUT /api/orders/:id/admin-delete
const deleteOrderForAdmin = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isDeletedByAdmin = true;
    const updatedOrder = await order.save();
    res.json({ message: "Đã xóa đơn hàng khỏi trang quản trị", isDeletedByAdmin: true });
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
};

// @route PUT /api/orders/:id/admin-restore
const restoreOrderForAdmin = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isDeletedByAdmin = false;
    await order.save();
    res.json({ message: "Đã khôi phục đơn hàng" });
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
}

// @desc    Hủy đơn hàng & Hoàn lại tồn kho (Logic chuẩn đã fix)
// @route   PUT /api/orders/:id/cancel
const updateOrderToCancelled = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.isCancelled) {
      return res.status(400).json({ message: "Đơn hàng này đã hủy rồi!" });
    }

    // --- LOGIC HOÀN KHO ---
    console.log("--- BẮT ĐẦU HOÀN KHO ---");
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);

      if (product) {
        console.log(`Đang xử lý SP: ${product.name} | SL mua: ${item.qty}`);

        // Kiểm tra xem đơn hàng có lưu variantId không?
        const hasVariantInfo = item.variantId ? true : false;

        // TRƯỜNG HỢP A: LÀ SẢN PHẨM BIẾN THỂ
        if (hasVariantInfo && product.variants && product.variants.length > 0) {
          console.log(`-> Đây là SP biến thể. Tìm variantId: ${item.variantId}`);
          
          const variant = product.variants.find(
            (v) => v._id.toString() === item.variantId.toString()
          );

          if (variant) {
            console.log(`-> Tìm thấy biến thể! Kho cũ: ${variant.countInStock}`);
            
            // Cộng lại số lượng
            variant.countInStock = Number(variant.countInStock) + Number(item.qty);
            
            console.log(`-> Kho mới: ${variant.countInStock}`);

            // CÂU THẦN CHÚ LƯU BIẾN THỂ
            product.markModified('variants'); 
          } else {
            console.log("-> ⚠️ Cảnh báo: Có mã variantId nhưng ko tìm thấy trong Product");
          }
        } 
        // TRƯỜNG HỢP B: SẢN PHẨM THƯỜNG
        else {
          console.log(`-> Đây là SP thường.`);
          console.log(`-> Kho cũ: ${product.countInStock}`);
          product.countInStock = Number(product.countInStock) + Number(item.qty);
          console.log(`-> Kho mới: ${product.countInStock}`);
        }

        await product.save();
      }
    }
    console.log("--- KẾT THÚC HOÀN KHO ---");

    // --- CẬP NHẬT TRẠNG THÁI ---
    order.isCancelled = true;
    if (!order.isDelivered) {
       order.deliveredAt = null; 
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);

  } catch (error) {
    console.error("Lỗi Hủy Đơn:", error);
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  deleteOrderForAdmin,
  restoreOrderForAdmin,
  updateOrderToCancelled
};
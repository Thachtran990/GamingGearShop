const Order = require("../models/orderModel.js");
const Product = require("../models/productModel.js");
const User = require("../models/userModel.js"); // Import User để dùng cho thống kê
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
      // 👇 NHẬN THÊM DỮ LIỆU TỪ FRONTEND
      couponCode,
      discountAmount,
      // Thông tin khách vãng lai
      guestName,
      guestEmail,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm trong giỏ hàng" });
    }

    // --- 1. XỬ LÝ USER / GUEST ---
    let userId = null;
    let finalGuestInfo = null;

    // Check xem có token không để lấy User ID
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "bi_mat_khong_bat_mi");
        userId = decoded.id; // Lấy ID từ token
      } catch (error) {
        // Token lỗi thì coi như Guest
      }
    }

    // Nếu không phải thành viên -> Lưu thông tin Guest
    if (!userId) {
      finalGuestInfo = {
        name: guestName || "Khách vãng lai",
        email: guestEmail || "guest@example.com"
      };
    }

    // --- 2. TẠO ĐƠN HÀNG (Mapping lại item để tránh lỗi mất ID sản phẩm) ---
    const orderItemsMapped = orderItems.map((item) => ({
        name: item.name,
        qty: item.qty || item.quantity || 1,
        image: item.image,
        price: item.price,
        // 👇 FIX QUAN TRỌNG: Lấy product ID hoặc _id đều được (tránh lỗi Path `product` is required)
        product: item.product || item._id, 
        variantId: item.variantId || null,
        _id: undefined // Xóa _id của item trong giỏ để Mongo tự tạo _id mới
    }));

    const order = new Order({
      user: userId,
      guestInfo: finalGuestInfo,
      orderItems: orderItemsMapped,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      // 👇 LƯU COUPON VÀO DB
      couponCode,
      discountAmount
    });

    const createdOrder = await order.save();

    // --- 3. TRỪ TỒN KHO ---
    for (const item of orderItemsMapped) {
      const product = await Product.findById(item.product);

      if (product) {
        // TRƯỜNG HỢP A: SẢN PHẨM CÓ BIẾN THỂ
        if (item.variantId) {
          const variant = product.variants && product.variants.find(
            v => v._id.toString() === item.variantId.toString()
          );

          if (variant) {
            variant.countInStock = variant.countInStock - item.qty;
            if (variant.countInStock < 0) variant.countInStock = 0;
            product.markModified('variants'); // Bắt buộc dòng này mới lưu được biến thể
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
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật trạng thái đã thanh toán
// @route   PUT /api/orders/:id/pay
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer ? req.body.payer.email_address : "",
      };
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật trạng thái Đã giao hàng
// @route   PUT /api/orders/:id/deliver
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách đơn hàng của User
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật trạng thái đơn hàng (Admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      
      // Tự động cập nhật isDelivered nếu status là "Đã giao hàng"
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa vĩnh viễn đơn hàng khỏi trang Admin
// @route   PUT /api/orders/:id/admin-delete
const deleteOrderForAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDeletedByAdmin = true;
      await order.save();
      res.json({ message: "Đã xóa đơn hàng khỏi trang quản trị", isDeletedByAdmin: true });
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/admin-restore
const restoreOrderForAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDeletedByAdmin = false;
      await order.save();
      res.json({ message: "Đã khôi phục đơn hàng" });
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Hủy đơn hàng & Hoàn lại tồn kho
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

    // --- HOÀN KHO ---
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);

      if (product) {
        // Có biến thể
        if (item.variantId && product.variants && product.variants.length > 0) {
          const variant = product.variants.find(
            (v) => v._id.toString() === item.variantId.toString()
          );

          if (variant) {
            variant.countInStock = Number(variant.countInStock) + Number(item.qty);
            product.markModified('variants');
          }
        }
        // SP thường
        else {
          product.countInStock = Number(product.countInStock) + Number(item.qty);
        }
        await product.save();
      }
    }

    // Cập nhật trạng thái
    order.isCancelled = true;
    if (!order.isDelivered) {
      order.deliveredAt = null;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);

  } catch (error) {
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

// @desc    Lấy dữ liệu thống kê cho Dashboard
// @route   GET /api/orders/stats
const getDashboardStats = async (req, res) => {
  try {
    const productsCount = await Product.countDocuments();
    const usersCount = await User.countDocuments();
    const ordersCount = await Order.countDocuments();

    const totalRevenueResult = await Order.aggregate([
      { $match: { isCancelled: false } },
      { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalSales : 0;

    const dailyStats = await Order.aggregate([
      { $match: { isCancelled: false } },
      {
        $group: {
          _id: { $dateToString: { format: "%d-%m", date: "$createdAt" } },
          sales: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    res.json({ productsCount, usersCount, ordersCount, totalRevenue, dailyStats });

  } catch (error) {
    res.status(500).json({ message: error.message });
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
  updateOrderToCancelled,
  getDashboardStats,
};
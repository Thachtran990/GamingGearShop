const Coupon = require("../models/couponModel.js");

// @desc    Tạo mã giảm giá mới (Admin)
// @route   POST /api/coupons
const createCoupon = async (req, res) => {
  try {
    const { 
      code, discountType, discountValue, minOrderValue, maxDiscountAmount, expirationDate, countInStock 
    } = req.body;

    // Kiểm tra xem mã đã tồn tại chưa
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
      return res.status(400).json({ message: "Mã giảm giá này đã tồn tại!" });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscountAmount: maxDiscountAmount || 0,
      expirationDate,
      countInStock: countInStock || 100
    });

    if (coupon) {
      res.status(201).json(coupon);
    } else {
      res.status(400).json({ message: "Dữ liệu mã giảm giá không hợp lệ" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};

// @desc    Lấy tất cả mã giảm giá (Admin)
// @route   GET /api/coupons
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa mã giảm giá (Admin)
// @route   DELETE /api/coupons/:id
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.deleteOne();
      res.json({ message: "Đã xóa mã giảm giá" });
    } else {
      res.status(404).json({ message: "Không tìm thấy mã" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kiểm tra & Áp dụng mã giảm giá (User)
// @route   POST /api/coupons/apply
const applyCoupon = async (req, res) => {
  try {
    const { couponCode, orderTotal } = req.body;

    // 1. Tìm mã trong DB (Chỉ lấy mã đang active)
    const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(), 
        isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại hoặc đã bị khóa." });
    }

    // 2. Check hạn sử dụng
    if (new Date() > new Date(coupon.expirationDate)) {
      return res.status(400).json({ message: "Mã giảm giá đã hết hạn." });
    }

    // 3. Check số lượng
    if (coupon.usedCount >= coupon.countInStock) {
        return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng." });
    }

    // 4. Check giá trị đơn hàng tối thiểu
    if (orderTotal < coupon.minOrderValue) {
      return res.status(400).json({ 
          message: `Đơn hàng phải tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã này.` 
      });
    }

    // 5. Tính toán số tiền giảm
    let discountAmount = 0;

    if (coupon.discountType === "percent") {
      // Giảm theo %
      discountAmount = (orderTotal * coupon.discountValue) / 100;
      // Nếu có giảm tối đa, thì không được vượt quá
      if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === "fixed") {
      // Giảm tiền mặt
      discountAmount = coupon.discountValue;
    }

    // Đảm bảo không giảm quá số tiền đơn hàng
    if (discountAmount > orderTotal) {
        discountAmount = orderTotal;
    }

    res.json({
      code: coupon.code,
      discountAmount: discountAmount,
      newTotal: orderTotal - discountAmount,
      message: "Áp dụng mã thành công!"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCoupon, getCoupons, deleteCoupon, applyCoupon };